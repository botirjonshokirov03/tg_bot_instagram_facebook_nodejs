const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();

const telegramBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
  polling: false,
});

async function postToTelegram(postData) {
  const { title, description, images } = postData;
  const chatId = process.env.TELEGRAM_CHANNEL_ID;

  const mediaGroup = images.map((img, idx) => {
    const photoObj = {
      type: "photo",
      media: img,
    };

    if (idx === 0) {
      photoObj.caption = `<b>${title}</b>\n${description}`;
      photoObj.parse_mode = "HTML";
    }

    return photoObj;
  });

  await telegramBot.sendMediaGroup(chatId, mediaGroup);
}

module.exports = { postToTelegram };
