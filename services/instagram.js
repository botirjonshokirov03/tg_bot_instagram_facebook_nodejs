const axios = require("axios");
require("dotenv").config();

const { getAccessToken } = require("./utils/generateFbLongToken");

async function postToInstagram(postData) {
  const { title, description, images } = postData;

  if (!images.length) throw new Error("No images provided for Instagram.");

  const caption = `${title}\n\n${description}`;
  const accessToken = await getAccessToken();

  if (images.length === 1) {
    const singleRes = await axios.post(
      `https://graph.facebook.com/v18.0/${process.env.IG_PAGE_ID}/media`,
      null,
      {
        params: {
          image_url: images[0],
          caption,
          access_token: accessToken,
        },
      }
    );

    await axios.post(
      `https://graph.facebook.com/v18.0/${process.env.IG_PAGE_ID}/media_publish`,
      null,
      {
        params: {
          creation_id: singleRes.data.id,
          access_token: accessToken,
        },
      }
    );
  } else {
    const containerIds = [];

    for (const img of images) {
      const res = await axios.post(
        `https://graph.facebook.com/v18.0/${process.env.IG_PAGE_ID}/media`,
        null,
        {
          params: {
            image_url: img,
            is_carousel_item: true,
            access_token: accessToken,
          },
        }
      );
      containerIds.push(res.data.id);
    }

    const carouselRes = await axios.post(
      `https://graph.facebook.com/v18.0/${process.env.IG_PAGE_ID}/media`,
      null,
      {
        params: {
          media_type: "CAROUSEL",
          children: containerIds.join(","),
          caption,
          access_token: accessToken,
        },
      }
    );

    await axios.post(
      `https://graph.facebook.com/v18.0/${process.env.IG_PAGE_ID}/media_publish`,
      null,
      {
        params: {
          creation_id: carouselRes.data.id,
          access_token: accessToken,
        },
      }
    );
  }
}

module.exports = { postToInstagram };
