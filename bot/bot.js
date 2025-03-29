const TelegramBot = require("node-telegram-bot-api");
const dotenv = require("dotenv");
const createUserIfNotExists = require("../db/saveUser");
const Post = require("../db/models/Post");
const { postToTelegram } = require("../services/telegram");
const { postToFacebook } = require("../services/facebook");
const { postToInstagram } = require("../services/instagram");
const { uploadImageToImgbb } = require("../services/uploadImage");

dotenv.config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const userStates = {};

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  userStates[chatId] = { step: "phone" };
  await bot.sendMessage(chatId, "Welcome! Please send your phone number.", {
    reply_markup: {
      keyboard: [[{ text: "Share Contact", request_contact: true }]],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const state = userStates[chatId];
  if (!state || msg.text === "/start") return;

  const text = msg.text;

  switch (state.step) {
    case "phone":
      if (msg.contact && msg.contact.phone_number) {
        state.phone = msg.contact.phone_number;
        const user = await createUserIfNotExists(msg.from.id, state.phone);

        state.user = user;
        state.step = "title";
        await bot.sendMessage(chatId, "Great! Now send me the post title.");
      } else {
        await bot.sendMessage(
          chatId,
          "Please use the button to share your contact."
        );
      }
      break;

    case "title":
      state.title = text;
      state.step = "description";
      await bot.sendMessage(chatId, "Now send me the description.");
      break;

    case "description":
      state.description = text;
      state.images = [];
      state.step = "images";
      await bot.sendMessage(
        chatId,
        "Send up to 10 images. When done, type 'done'."
      );
      break;

    case "images":
      if (msg.photo) {
        const fileId = msg.photo[msg.photo.length - 1].file_id;

        if (state.images.length < 10) {
          try {
            const hostedUrl = await uploadImageToImgbb(fileId, bot);
            state.images.push(hostedUrl);

            await bot.sendMessage(
              chatId,
              `✅ Image ${state.images.length}/10 uploaded.`
            );
          } catch (err) {
            await bot.sendMessage(
              chatId,
              "❌ Failed to upload image. Try again."
            );
            console.error("Upload error:", err);
          }
        } else {
          await bot.sendMessage(chatId, "⚠️ Maximum of 10 images allowed.");
        }
      } else if (text && text.toLowerCase() === "done") {
        if (!state.images.length) {
          await bot.sendMessage(
            chatId,
            "❗ No images uploaded. Please send at least one."
          );
        } else {
          state.step = "confirm";

          const mediaGroup = state.images.map((img, idx) => {
            const item = {
              type: "photo",
              media: img,
            };

            if (idx === 0) {
              item.caption = `<b>Preview</b>\n<b>Title:</b> ${state.title}\n<b>Description:</b> ${state.description}`;
              item.parse_mode = "HTML";
            }

            return item;
          });

          await bot.sendMediaGroup(chatId, mediaGroup);

          await bot.sendMessage(
            chatId,
            "Type 'post' to confirm or 'cancel' to discard."
          );
        }
      }
      break;

    case "confirm":
      if (text.toLowerCase() === "post") {
        const newPost = new Post({
          title: state.title,
          description: state.description,
          images: state.images,
          user: state.user._id,
        });
        await newPost.save();

        await postToTelegram(state);
        await postToFacebook(state);
        await postToInstagram(state);

        await bot.sendMessage(chatId, "✅ Posted successfully!");
        delete userStates[chatId];
      } else if (text.toLowerCase() === "cancel") {
        delete userStates[chatId];
        await bot.sendMessage(chatId, "❌ Post canceled.");
      }
      break;
  }
});

module.exports = bot;
