const FacebookToken = require("../../db/models/FacebookToken");
const axios = require("axios");

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
  let record = await FacebookToken.findOne();

  if (!record) {
    throw new Error(
      "No long-lived token found. Please generate one manually first."
    );
  }

  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  if (record.expiresAt < now) {
    throw new Error("Token expired. Please manually re-authenticate.");
  }

  const fiveDaysFromNow = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

  if (record.lastRefreshed < oneDayAgo && record.expiresAt < fiveDaysFromNow) {
    return await refreshLongLivedToken(record.token);
  }

  return record.token;
}

module.exports = { getAccessToken };
