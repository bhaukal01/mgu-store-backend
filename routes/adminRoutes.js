const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const authMiddleware = require("../middleware/authMiddleware");
const Admin = require("../models/adminModel");
const Purchase = require("../models/purchaseModel");
require("dotenv").config();

const router = express.Router();
router.use(express.json());

// 🔐 Admin Login
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    Admin.findByEmail(email, (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });

        if (results.length === 0) return res.status(401).json({ error: "Invalid credentials" });

        const admin = results[0];

        bcrypt.compare(password, admin.password, (err, isMatch) => {
            if (isMatch) {
                const token = jwt.sign({ adminId: admin.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
                res.json({ token });
            } else {
                res.status(401).json({ error: "Invalid credentials" });
            }
        });
    });
});

// 📋 Get All Purchases (Protected)
router.get("/purchases", authMiddleware, (req, res) => {
    Purchase.getAllPurchases((err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json(results);
    });
});

module.exports = router;
