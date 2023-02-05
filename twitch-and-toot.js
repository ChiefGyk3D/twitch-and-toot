const Mastodon = require("mastodon-api");
const fs = require("fs");
const process = require('node:process');
const { getKey } = require("./modules/auth.js");
const { getData: getChannelData } = require("./modules/channelData.js");
const { getData: getStreamData } = require("./modules/getStreams.js");

let lastPostTime = 0;

// Config
const LAST_POST_TIME_FILE = process.env.LAST_POST_TIME_FILE || "last_post_time.txt";
const MASTODON_ACCESS_TOKEN = process.env.MASTODON_ACCESS_TOKEN;
const MASTODON_INSTANCE = process.env.MASTODON_INSTANCE;
const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_SECRET = process.env.TWITCH_SECRET;
const TWITCH_CHANNEL_NAME = process.env.TWITCH_CHANNEL_NAME;

// TODO: Make this not hard coded
const MAX_POST_INTERVAL = 1000 * 60 * 60 * 6; // Every 6 hours
const MESSAGES = [
  "The streamer is live! Check them out on Twitch!",
  "It's a good day for some live streaming, don't miss it!",
  "Streaming live now on Twitch, come join the fun!",
  "Go check out the stream, it's live!",
  "Don't miss the live stream, it's happening now!"
];

// Load last post time from file
if (fs.existsSync(LAST_POST_TIME_FILE)) {
  const contents = fs.readFileSync(LAST_POST_TIME_FILE);
  lastPostTime = parseInt(contents);
}

async function postToMastodon(status) {
  const MastonClient = new Mastodon({
    access_token: MASTODON_ACCESS_TOKEN,
    api_url: MASTODON_INSTANCE + "/api/v1/"
  });

  await MastodonClient.post("statuses", { status: status });
  lastPostTime = currentTime;
  console.log("Posed to Mastodon!")
}

async function checkStreamerStatus() {
  // Get Twitch API authentication token
  const authToken = await getKey(TWITCH_CLIENT_ID, TWITCH_SECRET);

  // Get channel data from Twitch API
  const channelData = await getChannelData(
    TWITCH_CHANNEL_NAME,
    TWITCH_CHANNEL_ID,
    authToken
  );

  if (!channelData) {
    console.error(`Could not find twitch channel: ${TWITCH_CHANNEL_NAME}`);
    process.exit(1);
    return;
  }

  // Get stream data from Twitch API
  const streamData = await getStreamData(
    TWITCH_CHANNEL_NAME,
    TWITCH_CHANNEL_ID,
    authToken
  );

  // Check if the streamer is live
  if (streamData.data.length === 0) {
    console.log(`${TWITCH_CHANNEL_NAME} is currently offline.`);
    return;
  } else {
    console.log(`${TWITCH_CHANNEL_NAME} is live!`);
  }

  // Check if it has been more than 6 hours since the last post
  const currentTime = new Date().getTime();
  const timeSinceLastPost = currentTime - lastPostTime;

  if (timeSinceLastPost < MAX_POST_INTERVAL) {
    return; // Already posted
  }

  // Post messages
  let liveMessage = messages[Math.floor(Math.random() * messages.length)];
  postToMastodon(liveMessage);

  // Persist last post status
  lastPostTime = currentTime;
  fs.writeFileSync(LAST_POST_TIME_FILE, currentTime.toString());
}


// Check the streamer status every 10 minutes
checkStreamerStatus();
setInterval(checkStreamerStatus, 1000 * 60 * 10);
