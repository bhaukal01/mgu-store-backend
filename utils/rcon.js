const Rcon = require("rcon");

const rconClient = new Rcon(process.env.RCON_HOST, process.env.RCON_PORT, process.env.RCON_PASSWORD);

function grantRank(username, rank) {
    rconClient.connect();

    rconClient.on("auth", () => {
        console.log(`🔗 Connected to RCON. Granting rank ${rank} to ${username}`);
        rconClient.send(`lp user ${username} parent set ${rank}`);
    });

    rconClient.on("response", (message) => {
        console.log("🎮 RCON Response:", message);
        rconClient.disconnect();
    });

    rconClient.on("error", (err) => {
        console.error("❌ RCON Error:", err);
    });
}

module.exports = { grantRank };
