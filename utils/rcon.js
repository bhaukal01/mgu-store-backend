const Rcon = require("rcon");

const rconConfig = {
    host: process.env.RCON_HOST || "YOUR_SERVER_IP",
    port: process.env.RCON_PORT || 25575,
    password: process.env.RCON_PASSWORD || "YOUR_RCON_PASSWORD",
};

const executeRconCommand = (username, rank, duration, cb) => {
    return new Promise((resolve, reject) => {
        console.log("ClaimBlocks: ", cb);
        if (!username || !rank) {
            return reject("Username and rank are required");
        }

        const rcon = new Rcon(rconConfig.host, rconConfig.port, rconConfig.password);

        //when purchased subscription based rank
        if (duration) {
            const command = `lp user ${username} group addtemp ${rank} ${duration}`;

            rcon
                .on("auth", () => {
                    console.log("✅ RCON Connected.");
                    rcon.send(command);
                    setTimeout(() => rcon.disconnect(), 500);
                    resolve(`Command executed: ${command}`);
                    console.log("Command: ", command);
                })
                .on("error", (err) => {
                    console.error("❌ RCON Error:", err);
                    reject("RCON connection failed");
                });
        }

        //wehn purchased permanent rank
        else {
            const command = `lp user ${username} group add ${rank}`;
            const command2 = `acb ${username} ${cb}`;
            rcon
                .on("auth", () => {
                    console.log("✅ RCON Connected.");
                    rcon.send(command);
                    rcon.send(command2);
                    setTimeout(() => rcon.disconnect(), 500);
                    resolve(`Command executed: ${command}`);
                    resolve(`Command executed: ${command2}`);
                    console.log("Command: ", command);
                    console.log("Command2: ", command2);
                })
                .on("error", (err) => {
                    console.error("❌ RCON Error:", err);
                    reject("RCON connection failed");
                });
        }

        // rcon
        //     .on("auth", () => {
        //         console.log("✅ RCON Connected.");
        //         const command = `lp user ${username} group add ${rank}`;
        //         rcon.send(command);
        //         setTimeout(() => rcon.disconnect(), 500); 
        //         resolve(`Command executed: ${command}`);
        //     })
        //     .on("error", (err) => {
        //         console.error("❌ RCON Error:", err);
        //         reject("RCON connection failed");
        //     });

        rcon.connect();
    });
};

module.exports = executeRconCommand;
