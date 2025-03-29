const axios = require("axios");
const fs = require("fs");
const path = require("path");

require("dotenv").config();

const tokenFilePath = path.resolve(__dirname, "../data/fb_token.json");

async function getLongLivedAccessToken() {
  try {
    const response = await axios.get(
      "https://graph.facebook.com/v18.0/oauth/access_token",
      {
        params: {
          grant_type: "fb_exchange_token",
          client_id: process.env.FB_APP_ID,
          client_secret: process.env.FB_APP_SECRET,
          fb_exchange_token: process.env.FB_SHORT_TOKEN,
        },
      }
    );

    const longToken = response.data.access_token;

    fs.writeFileSync(
      tokenFilePath,
      JSON.stringify({ token: longToken }, null, 2)
    );

    console.log("Long-lived Facebook token saved.");
    return longToken;
  } catch (error) {
    console.error(
      "Failed to generate long-lived token:",
      error.response?.data || error.message
    );
    throw error;
  }
}

module.exports = { getLongLivedAccessToken };
