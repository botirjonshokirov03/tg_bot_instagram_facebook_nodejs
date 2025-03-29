const mongoose = require("mongoose");

const facebookTokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  lastRefreshed: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

module.exports = mongoose.model("FacebookToken", facebookTokenSchema);
