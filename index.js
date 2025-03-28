const dotenv = require("dotenv");
const connectDB = require("./db");
require("./bot/bot");

dotenv.config();

(async () => {
  try {
    await connectDB();
    console.log("✅ Connected to MongoDB");

    console.log("🚀 Telegram bot is running...");
  } catch (err) {
    console.error("❌ Error starting application:", err);
    process.exit(1);
  }
})();
