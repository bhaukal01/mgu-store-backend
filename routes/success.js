const express = require("express");
const router = express.Router();
const Purchase = require("../models/purchaseModel");

router.post("/pay-success", async (req, res) => {
    try {
        const { username, rank, price } = req.body;

        if (!username || !rank || !price) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Insert into database with status 'completed'
        Purchase.createPurchase(username, rank, price, (err) => {
            if (err) {
                console.error("❌ Database Insert Error:", err);
                return res.status(500).json({ error: "Database error" });
            }

            console.log(`✅ Payment Success: ${username} bought ${rank} for ₹${price}`);
            return res.json({ success: true });
        });
    } catch (error) {
        console.error("❌ API Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
