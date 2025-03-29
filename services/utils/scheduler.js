const cron = require("node-cron");
const connectDB = require("../../db");
const mongoose = require("mongoose");
require("dotenv").config();

const { getAccessToken } = require("./generateFbLongToken");

async function runTokenCheck() {
  try {
    await connectDB();
    await getAccessToken();
    console.log("Daily token check completed.");
    await mongoose.disconnect();
  } catch (err) {
    console.error("Error during daily token check:", err.message);
  }
}

// Runs every day at 03:00 AM
cron.schedule("0 3 * * *", runTokenCheck);

console.log("Token refresh scheduler started.");
