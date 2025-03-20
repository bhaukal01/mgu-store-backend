const express = require("express");
const db = require("../db");
const Purchase = require("../models/purchaseModel");
const axios = require("axios");
require("dotenv").config();

const router = express.Router();
router.use(express.json());

// 🛒 Purchase a Rank
router.post("/buy", async (req, res) => {
    const { username, rank, price } = req.body;

    if (!username || !rank || !price) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate price
    const priceAmount = Number(price);
    if (isNaN(priceAmount) || priceAmount <= 0) {
        return res.status(400).json({ error: "Invalid price amount" });
    }

    try {
        // Check if the user already has a rank
        Purchase.checkExistingRank(username, async (err, results) => {
            if (err) {
                console.error("❌ Database Error:", err);
                return res.status(500).json({ error: "Database error" });
            }

            if (results.length > 0) {
                const existingRank = results[0].rank;
                return res.status(400).json({
                    error: `User already has a rank (${existingRank}). Consider purchasing a rank upgrade.`,
                });
            }

            // Generate a valid order ID
            const orderId = `ORDER_${Date.now().toString()}`;

            // Prepare payment data
            const paymentData = {
                order_id: orderId,
                order_amount: priceAmount,
                order_currency: "INR",
                customer_details: {
                    customer_id: username,
                    customer_name: username,
                    customer_phone: "9999999999", // Required by Cashfree
                },
            };

            console.log("🔹 Sending Payment Request:", JSON.stringify(paymentData, null, 2));

            const cashfreeUrl = process.env.CASHFREE_TEST_MODE === "true"
                ? "https://sandbox.cashfree.com/pg/orders"
                : "https://api.cashfree.com/pg/orders";

            const response = await axios.post(cashfreeUrl, paymentData, {
                headers: {
                    "Content-Type": "application/json",
                    "x-client-id": process.env.CASHFREE_APP_ID,
                    "x-client-secret": process.env.CASHFREE_SECRET_KEY,
                    "x-api-version": "2022-09-01",
                },
            });

            if (response.data?.payment_session_id) {
                console.log("✅ Payment Session Created:", response.data.payment_session_id);
                return res.json({ paymentSessionId: response.data.payment_session_id });
            } else {
                console.error("❌ Cashfree Response Error:", response.data);
                return res.status(500).json({ error: "Failed to generate payment session" });
            }
        });
    } catch (error) {
        console.error("❌ Cashfree API Error:", error.response?.data || error.message);
        return res.status(500).json({ error: "Payment gateway error" });
    }
});

// ✅ Webhook to Confirm Payment
router.post("/cashfree-webhook", async (req, res) => {
    console.log("🔹 Webhook received:", JSON.stringify(req.body, null, 2));
    try {
        console.log("✅ Webhook hit!"); // Check if webhook is triggered

        const { order_id, order_status, order_amount, customer_details } = req.body;

        if (!order_id || !order_status || !order_amount || !customer_details?.customer_id) {
            console.error("❌ Invalid webhook data:", req.body);
            return res.status(400).json({ error: "Invalid webhook data" });
        }

        console.log("✅ Webhook Data:", req.body);

        if (order_status === "PAID") {
            const username = customer_details.customer_id;
            const rank = "RankName"; // Set correct rank

            console.log(`🔹 Attempting to insert: Username=${username}, Rank=${rank}, Price=${order_amount}`);

            // Save Purchase in Database
            Purchase.createPurchase(username, rank, order_amount, function (err) {
                if (err) {
                    console.error("❌ Database Insert Error:", err);
                    return res.status(500).json({ error: "Database error" });
                }
                console.log(`✅ Purchase recorded: ${username}, Rank: ${rank}, Amount: ${order_amount}`);
            });

            return res.json({ success: true });
        } else {
            console.warn(`⚠️ Payment not completed for order ${order_id}`);
            return res.status(400).json({ error: "Payment not completed" });
        }
    } catch (error) {
        console.error("❌ Webhook Processing Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});


module.exports = router;
