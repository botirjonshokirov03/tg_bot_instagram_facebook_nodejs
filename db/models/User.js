const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
});

module.exports = mongoose.model("User", userSchema);
