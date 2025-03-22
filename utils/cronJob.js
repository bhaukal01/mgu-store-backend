const cron = require("node-cron");
const db = require("../db");

const removeExpiredRanks = () => {
    console.log("🔄 Checking for expired ranks...");

    const query = `
    DELETE FROM purchases 
    WHERE rank LIKE '%Days%' 
    AND created_at < NOW() - INTERVAL 30 DAY
  `;

    db.query(query, (err, result) => {
        if (err) {
            console.error("❌ Database error:", err);
        } else if (result.affectedRows > 0) {
            console.log(`✅ Removed ${result.affectedRows} expired ranks.`);
        } else {
            console.log("📌 No expired ranks found.");
        }
    });
};

// everyday midnight
cron.schedule("0 0 * * *", removeExpiredRanks);

module.exports = removeExpiredRanks;
