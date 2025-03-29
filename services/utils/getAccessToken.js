const fs = require("fs");
const path = require("path");

const tokenPath = path.resolve(__dirname, "../data/fb_token.json");

function getAccessToken() {
  try {
    if (fs.existsSync(tokenPath)) {
      const raw = fs.readFileSync(tokenPath, "utf-8");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.token) return parsed.token;
      }
    }
    throw new Error("No saved token found. Please generate manually.");
  } catch (err) {
    console.error("Failed to read Facebook token:", err.message);
    throw err;
  }
}

module.exports = { getAccessToken };
