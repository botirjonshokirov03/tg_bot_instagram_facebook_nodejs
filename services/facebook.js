const axios = require("axios");
require("dotenv").config();

const { getAccessToken } = require("./utils/generateFbLongToken");

async function postToFacebook(postData) {
  const accessToken = await getAccessToken();
  const { title, description, images } = postData;
  const attachedMedia = [];

  for (const imgUrl of images) {
    try {
      const uploadRes = await axios.post(
        `https://graph.facebook.com/${process.env.FB_PAGE_ID}/photos`,
        null,
        {
          params: {
            url: imgUrl,
            published: false,
            access_token: accessToken,
          },
        }
      );

      attachedMedia.push({ media_fbid: uploadRes.data.id });
    } catch (err) {
      console.error(
        "Failed to upload image to Facebook:",
        imgUrl,
        err?.response?.data || err.message
      );
    }
  }

  if (attachedMedia.length === 0) {
    throw new Error("No images were successfully uploaded to Facebook.");
  }

  await axios.post(
    `https://graph.facebook.com/${process.env.FB_PAGE_ID}/feed`,
    null,
    {
      params: {
        message: `${title}\n\n${description}`,
        attached_media: JSON.stringify(attachedMedia),
        access_token: accessToken,
      },
    }
  );
}

module.exports = { postToFacebook };
