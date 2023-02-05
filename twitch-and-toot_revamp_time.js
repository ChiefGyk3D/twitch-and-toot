const mastodon = require("mastodon-api");
const config = require("./config.json");
const fs = require("fs");
const { getKey } = require("./modules/auth.js");
const { getData: getChannelData } = require("./modules/channelData.js");
const { getData: getStreamData } = require("./modules/getStreams.js");
const randomIndex = Math.floor(Math.random() * 5);

// Define a list of messages to be posted randomly when the streamer is live
const messages = [
  "The streamer is live! Check them out on Twitch!",
  "It's a good day for some live streaming, don't miss it!",
  "Streaming live now on Twitch, come join the fun!",
  "Go check out the stream, it's live!",
  "Don't miss the live stream, it's happening now!"
];

let lastPostTime = 0;

async function postToMastodon(status) {
  const currentTime = new Date().getTime();

  if (currentTime - lastPostTime >= 6 * 60 * 60 * 1000) {
    const M = new mastodon({
      access_token: config.mastodonAccessToken,
      api_url: config.mastodonInstance + "/api/v1/"
    });

    M.post("statuses", { status: status }, (error, data) => {
      if (error) {
        console.error(error);
      } else {
        console.log("Post to Mastodon successful!");
        lastPostTime = currentTime;
      }
    });
  } else {
    console.log("Mastodon post skipped, last post was less than 6 hours ago.");
  }
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

  // Check if it has been more than 6 hours since the last post
  const lastPostTime = fs.existsSync("./lastPostTime.txt")
    ? parseInt(fs.readFileSync("./lastPostTime.txt").toString(), 10)
    : 0;
  const now = new Date().getTime();
  if (now - lastPostTime > 6 * 60 * 60 * 1000) {
    // Post to Mastodon
    postToMastodon(messages[randomIndex]);

    // Save the time of this post
    fs.writeFileSync("./lastPostTime.txt", now.toString());
  }
}


// Check the streamer status every 10 minutes
checkStreamerStatus();
setInterval(checkStreamerStatus, 600000);
