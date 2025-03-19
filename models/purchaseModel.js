const db = require("../db");

const Purchase = {
    checkExistingRank: (username, callback) => {
        db.query(
            "SELECT rank FROM purchases WHERE username = ? ORDER BY id DESC LIMIT 1",
            [username],
            callback
        );
    },

    createPurchase: (username, rank, price, callback) => {
        db.query(
            "INSERT INTO purchases (username, rank, price, status) VALUES (?, ?, ?, 'pending')",
            [username, rank, price],
            callback
        );
    },

    confirmPayment: (orderId, callback) => {
        db.query("UPDATE purchases SET status = 'completed' WHERE id = ?", [orderId], callback);
    },

    getRecentPurchases: (callback) => {
        db.query(
            "SELECT username, rank, price, created_at FROM purchases ORDER BY created_at DESC LIMIT 5",
            callback
        );
    },

    getAllPurchases: (callback) => {
        db.query("SELECT * FROM purchases ORDER BY created_at DESC", callback);
    },

    getUsernameById: (orderId, callback) => {
        db.query(
            "SELECT username, rank FROM purchases WHERE id = ?",
            [orderId],
            callback
        );
    },
};

module.exports = Purchase;
