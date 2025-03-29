const axios = require("axios");
const moment = require("moment");

const FacebookToken = require("../../db/models/FacebookToken");

async function refreshLongLivedToken(currentToken) {
  const response = await axios.get(
    "https://graph.facebook.com/v18.0/oauth/access_token",
    {
      params: {
        grant_type: "fb_exchange_token",
        client_id: process.env.FB_APP_ID,
        client_secret: process.env.FB_APP_SECRET,
        fb_exchange_token: currentToken,
      },
    }
  );

  const newToken = response.data.access_token;
  const expiresAt = new Date(Date.now() + response.data.expires_in * 1000);

  await FacebookToken.deleteMany({});
  await FacebookToken.create({
    token: newToken,
    lastRefreshed: new Date(),
    expiresAt,
  });

  console.log("Refreshed long-lived Facebook token");
  return newToken;
}

async function getAccessToken() {
  const record = await FacebookToken.findOne();

  if (!record) {
    throw new Error(
      "No long-lived token found. Please generate one manually first."
    );
  }

  const now = moment();
  const lastRefreshed = moment(record.lastRefreshed);
  const expiresAt = moment(record.expiresAt);

  if (expiresAt.isBefore(now)) {
    throw new Error("Token expired. Please manually re-authenticate.");
  }

  // Refresh if 50+ days have passed since last refresh
  if (now.diff(lastRefreshed, "days") >= 50) {
    return await refreshLongLivedToken(record.token);
  }

  return record.token;
}

module.exports = { getAccessToken };
