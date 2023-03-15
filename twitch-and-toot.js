const mastodon = require("mastodon-api");
const config = require("./config.json");
const fs = require("fs");
const { getKey } = require("./modules/auth.js");
const { getData: getChannelData } = require("./modules/channelData.js");
const { getData: getStreamData } = require("./modules/getStreams.js");
const messages = config.messages;

let lastPostTime;
try {
  lastPostTime = Number(fs.readFileSync("lastPostTime.txt", "utf-8"));
  if (isNaN(lastPostTime)) lastPostTime = 0;
} catch (error) {
  lastPostTime = 0;
}

let prevStreamStatus;
try {
  prevStreamStatus = fs.readFileSync("streamStatus.txt", "utf-8");
} catch (error) {
  prevStreamStatus = "offline";
}

let lastOnlineTime;
try {
  lastOnlineTime = Number(fs.readFileSync("lastOnlineTime.txt", "utf-8"));
  if (isNaN(lastOnlineTime)) lastOnlineTime = 0;
} catch (error) {
  lastOnlineTime = 0;
}

let sendAnnouncement = false;

// ... (rest of the code - postToMastodon function)

async function checkStreamerStatus() {
  // ... (rest of the code - checkStreamerStatus function before checking if streamer is live)

  // Check if the streamer is live
  if (streamData.data.length === 0) {
    console.log(`${config.ChannelName} is currently offline.`);

    const currentTime = new Date().getTime();
    const timeSinceLastOnline = currentTime - lastOnlineTime;
    const thirtyMinutesInMilliseconds = 30 * 60 * 1000;

    if (prevStreamStatus === "online" && timeSinceLastOnline <= thirtyMinutesInMilliseconds) {
      const randomEndMessage = config.endOfStreamMessages[Math.floor(Math.random() * config.endOfStreamMessages.length)];
      const endMessage = randomEndMessage.replace("{streamTitle}", streamTitle);
      postToMastodon(endMessage);
      fs.writeFileSync("streamStatus.txt", "offline");
      sendAnnouncement = false;
    }
    return;
  } else {
    console.log(`${config.ChannelName} is live!`);
    if (prevStreamStatus === "offline") {
      fs.writeFileSync("streamStatus.txt", "online");
      fs.writeFileSync("lastOnlineTime.txt", new Date().getTime());
    }
  }

  // ... (rest of the code - checkStreamerStatus function after checking if streamer is live)
}

// Check the streamer status every 10 minutes
checkStreamerStatus();
setInterval(checkStreamerStatus, 600000);

