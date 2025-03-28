const axios = require("axios");
const FormData = require("form-data");
require("dotenv").config();

async function uploadImageToImgbb(fileId, bot) {
  try {
    const file = await bot.getFile(fileId);
    const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;

    const fileRes = await axios.get(fileUrl, { responseType: "arraybuffer" });
    const base64Image = Buffer.from(fileRes.data).toString("base64");

    const form = new FormData();
    form.append("image", base64Image);

    const response = await axios.post(
      `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
      form,
      { headers: form.getHeaders() }
    );

    return response.data.data.url;
  } catch (err) {
    console.error("Upload error:", err.response?.data || err.message);
    throw err;
  }
}

module.exports = { uploadImageToImgbb };
