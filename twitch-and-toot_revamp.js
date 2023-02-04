const mastodon = require("mastodon-api");
const config = require("./config.json");
const fs = require("fs");
const { getKey } = require("./modules/auth.js");
const { getData: getChannelData } = require("./modules/channelData.js");
const { getData: getStreamData } = require("./modules/getStreams.js");

// Define a list of messages to be posted randomly when the streamer is live
const messages = [
  "The streamer is live! Check them out on Twitch!",
  "It's a good day for some live streaming, don't miss it!",
  "Streaming live now on Twitch, come join the fun!",
  "Go check out the stream, it's live!",
  "Don't miss the live stream, it's happening now!"
];

async function postToMastodon(status) {
  const M = new mastodon({
    access_token: config.mastodonAccessToken,
    api_url: config.mastodonInstance + "/api/v1/"
  });

  M.post("statuses", { status: status }, (error, data) => {
    if (error) {
      console.error(error);
    } else {
      console.log("Post to Mastodon successful!");
    }
  });
}

async function checkStreamerStatus() {
  // Get Twitch API authentication token
  const authToken = await getKey(config.twitch_clientID, config.twitch_secret);

  // Get channel data from Twitch API
  const channelData = await getChannelData(
    config.ChannelName,
    config.twitch_clientID,
    authToken
  );

  if (!channelData) {
    console.error(`Channel "${config.ChannelName}" not found on Twitch.`);
    return;
  }

  // Get stream data from Twitch API
  const streamData = await getStreamData(
    config.ChannelName,
    config.twitch_clientID,
    authToken
  );

  // Check if the streamer is live
  if (streamData.data.length === 0) {
    console.log(`${config.ChannelName} is currently offline.`);
    return;
  } else {
    console.log(`${config.ChannelName} is live!`);
  }

  // Check if it's been more than 12 hours since the last post
  const currentTime = new Date();
  const lastPostTime = new Date(config.lastPostTime);
  const timeDifference = currentTime - lastPostTime;

  if (timeDifference >= 43200000) {
    // Generate a random message from the list
    const message = messages[Math.floor(Math.random() * messages.length)];

    // Post to Mastodon
    postToMastodon(message);

    // Update lastPostTime in the config
    config.lastPostTime = currentTime;
    fs.writeFileSync("./config.json", JSON.stringify(config));
  }
}

// Check the streamer status every 10 minutes
checkStreamerStatus()
setInterval(checkStreamerStatus, 600000);
