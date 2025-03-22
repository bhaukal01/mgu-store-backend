const express = require("express");
const executeRconCommand = require("../utils/rcon");
const router = express.Router();

router.post("/rcon", async (req, res) => {
    var { username, rank, duration } = req.body;

    if (rank == "VIP") {
        rank = "vip";
        duration = null;
    }
    else if (rank == "VIP+") {
        rank = "vip+";
        duration = null;
    }
    else if (rank == "Prince") {
        rank = "prince";
        duration = null;
    }
    else if (rank == "King") {
        rank = "king";
        duration = null;
    }
    else if (rank == "Emperor") {
        rank = "emperor";
        duration = null;
    }
    else if (rank == "Deity") {
        rank = "deity";
        duration = null;
    }
    else if (rank == "King (30 Days)") {
        rank = "king";
        duration = "30d";
    }
    else if (rank == "Emperor (30 Days)") {
        rank = "ermperor";
        duration = "30d";
    }
    else if (rank == "Deity (30 Days)") {
        rank = "deity";
        duration = "30d";
    }


    if (!username || !rank) {
        return res.status(400).json({ error: "Username and rank are required" });
    }

    try {
        const result = await executeRconCommand(username, rank, duration);
        res.json({ success: true, message: result });
    } catch (error) {
        res.status(500).json({ error: error });
    }
});

module.exports = router;
