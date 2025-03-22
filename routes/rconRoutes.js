const express = require("express");
const executeRconCommand = require("../utils/rcon");
const router = express.Router();

router.post("/rcon", async (req, res) => {
    const { username, rank } = req.body;

    if (!username || !rank) {
        return res.status(400).json({ error: "Username and rank are required" });
    }

    try {
        const result = await executeRconCommand(username, rank);
        res.json({ success: true, message: result });
    } catch (error) {
        res.status(500).json({ error: error });
    }
});

module.exports = router;
