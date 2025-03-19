const express = require("express");
const db = require("../db");
const Purchase = require("../models/purchaseModel");
const axios = require("axios");
require("dotenv").config();
const rcon = require("../utils/rcon"); // Import RCON Utility

const router = express.Router();
router.use(express.json());

// 🛒 Purchase a Rank (Initiate Payment)
router.post("/buy", async (req, res) => {
    const { username, rank, price } = req.body;

    if (!username || !rank || !price) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const paymentData = {
            order_id: `ORDER_${Date.now()}`,
            order_amount: price,
            order_currency: "INR",
            customer_details: {
                customer_id: username,
                customer_name: username,
                customer_phone: "9999999999"
            }
        };

        const cashfreeUrl = process.env.CASHFREE_TEST_MODE === "true"
            ? "https://sandbox.cashfree.com/pg/orders"
            : "https://api.cashfree.com/pg/orders";

        const response = await axios.post(cashfreeUrl, paymentData, {
            headers: {
                "Content-Type": "application/json",
                "x-client-id": process.env.CASHFREE_APP_ID,
                "x-client-secret": process.env.CASHFREE_SECRET_KEY,
                "x-api-version": "2022-09-01"
            }
        });

        console.log("Cashfree API Response:", response.data); // 🔹 Debugging line

        const paymentUrl = response.data.payments?.url; // ✅ Correct URL

        if (paymentUrl) {
            return res.json({ paymentUrl }); // ✅ Send Correct URL
        } else {
            console.error("Cashfree Response Error:", response.data);
            return res.status(500).json({ error: "Failed to generate payment link" });
        }
    } catch (error) {
        console.error("❌ Cashfree API Error:", error.response?.data || error.message);
        return res.status(500).json({ error: "Payment gateway error" });
    }
});


// ✅ Cashfree Webhook (Payment Verification)
router.post("/cashfree-webhook", async (req, res) => {
    try {
        const { order_id, order_status, order_amount, customer_details } = req.body;

        if (!order_id || !order_status || !order_amount || !customer_details) {
            return res.status(400).json({ error: "Invalid webhook data" });
        }

        if (order_status === "PAID") {
            const username = customer_details.customer_id; // Get username

            // ✅ Save Purchase in Database Only After Payment Success
            Purchase.createPurchase(username, order_amount, (err, result) => {
                if (err) {
                    console.error("❌ Database Error:", err);
                    return res.status(500).json({ error: "Database error" });
                }

                // 🎮 Send RCON Command (Grant Rank)
                rcon.grantRank(username);
                console.log(`✅ Rank granted to ${username}`);

                return res.json({ success: true, message: "Payment confirmed & rank granted!" });
            });
        } else {
            console.warn(`⚠️ Payment not completed for order: ${order_id}`);
            return res.status(400).json({ error: "Payment not completed" });
        }
    } catch (error) {
        console.error("❌ Webhook Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
