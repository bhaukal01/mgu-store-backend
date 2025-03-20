const express = require("express");
const router = express.Router();
const Purchase = require("../models/Purchase"); // Assuming you have a Purchase model

router.post("/pay-success", async (req, res) => {
    try {
        const { username, rank, amount, order_id } = req.body;

        if (!username || !rank || !amount || !order_id) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Save the purchase in the database
        Purchase.createPurchase(username, rank, amount, (err) => {
            if (err) {
                console.error("❌ Database Insert Error:", err);
                return res.status(500).json({ error: "Database error" });
            }
            console.log(`✅ Purchase recorded: ${username} bought ${rank} for ₹${amount}`);
            return res.json({ success: true });
        });

    } catch (error) {
        console.error("❌ Error in /api/pay-success:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
