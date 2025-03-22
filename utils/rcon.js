const Rcon = require("rcon");

// RCON Configuration
const rconConfig = {
    host: process.env.RCON_HOST || "YOUR_SERVER_IP",
    port: process.env.RCON_PORT || 25575,
    password: process.env.RCON_PASSWORD || "YOUR_RCON_PASSWORD",
};

const executeRconCommand = (username, rank) => {
    return new Promise((resolve, reject) => {
        if (!username || !rank) {
            return reject("Username and rank are required");
        }

        const rcon = new Rcon(rconConfig.host, rconConfig.port, rconConfig.password);

        rcon
            .on("auth", () => {
                console.log("✅ RCON Connected.");
                const command = `/lp user ${username} group add ${rank}`;
                rcon.send(command);
                rcon.end();
                resolve(`Command executed: ${command}`);
            })
            .on("error", (err) => {
                console.error("❌ RCON Error:", err);
                reject("RCON connection failed");
            });

        rcon.connect();
    });
};

module.exports = executeRconCommand;
