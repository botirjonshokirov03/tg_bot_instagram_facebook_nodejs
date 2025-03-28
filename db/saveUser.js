const User = require("./models/User");

const createUserIfNotExists = async (telegramId, phone) => {
  let user = await User.findOne({ telegramId });
  if (!user) {
    user = new User({ telegramId, phone });
    await user.save();
  }
  return user;
};

module.exports = createUserIfNotExists;
