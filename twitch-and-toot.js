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

async function postToMastodon(status) {
  const currentTime = new Date().getTime();
  const minMillisecondsBetweenPosts = config.minHoursBetweenPosts * 60 * 60 * 1000;

  if (currentTime - lastPostTime >= minMillisecondsBetweenPosts) {
    const M = new mastodon({
      access_token: config.mastodonAccessToken,
      api_url: config.mastodonInstance + "/api/v1/"
    });

    M.post("statuses", { status: status }, (error, data) => {
      if (error) {
        console.error(error);
      } else if (!sendAnnouncement) {
        console.log("Post to Mastodon successful!");
        lastPostTime = currentTime;
        fs.writeFile("lastPostTime.txt", lastPostTime, (err) => {
          if (err) console.error("Error writing lastPostTime to file:", err);
        });
        sendAnnouncement = true;
      }
    });
  } else {
    console.log(`Mastodon post skipped, last post was less than ${config.minHoursBetweenPosts} hours ago.`);
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

  // Extract the stream title and URL
  const streamTitle = (streamData.data[0] && streamData.data[0].title) || '';
  const streamUrl = `https://www.twitch.tv/${config.ChannelName}`;

  // Check if the streamer is live
  if (streamData.data.length === 0) {
    console.log(`${config.ChannelName} is currently offline.`);

    if (prevStreamStatus === "online") {
      const currentTime = new Date().getTime();
      const timeSinceLastOnline = currentTime - lastOnlineTime;
      const minutesToWaitBeforeEndOfStreamMessage = config.minutesToWaitBeforeEndOfStreamMessage * 60 * 1000;

      fs.writeFileSync("lastOnlineTime.txt", new Date().getTime());
      console.log("Writing current time to lastOnlineTime.txt");

      if (config.enableEndOfStreamMessage && timeSinceLastOnline <= minutesToWaitBeforeEndOfStreamMessage) {
        const randomEndMessage = config.endOfStreamMessages[Math.floor(Math.random() * config.endOfStreamMessages.length)];
        const endMessage = randomEndMessage.replace("{streamTitle}", streamTitle);
        postToMastodon(endMessage);
        sendAnnouncement = false;
      }
      fs.writeFileSync("streamStatus.txt", "offline");
      console.log("Writing 'offline' to streamStatus.txt");
    }
    
    return;
  } else {
    console.log(`${config.ChannelName} is live!`);
    if (prevStreamStatus === "offline") {
      fs.writeFileSync("streamStatus.txt", "online");
      console.log("Writing 'online' to streamStatus.txt");
    }
  }

  // Check if it has been more than the configured hours since the last post
  if (!sendAnnouncement) {
    // Post to Mastodon with the stream title and URL
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    const tootMessage = randomMessage
      .replace("{streamTitle}", streamTitle)
      .replace("{streamUrl}", streamUrl);
    postToMastodon(tootMessage);
  }
}


// Check the streamer status every 10 minutes
checkStreamerStatus();
setInterval(checkStreamerStatus, 600000);

