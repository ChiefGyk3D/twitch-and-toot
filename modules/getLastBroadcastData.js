// modules/getLastBroadcastData.js

const axios = require("axios");

async function getLastBroadcastData(channelId, clientId, authToken) {
  const url = `https://api.twitch.tv/helix/videos?user_id=${channelId}&first=1&type=archive`;

  const options = {
    headers: {
      "Client-ID": clientId,
      "Authorization": `Bearer ${authToken}`
    }
  };

  try {
    const response = await axios.get(url, options);
    return response.data;
  } catch (error) {
    console.error(`Error fetching last broadcast data: ${error}`);
    return null;
  }
}

module.exports = { getData: getLastBroadcastData };
