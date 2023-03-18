const config = require("./config.json");
const fs = require("fs");
const mastodon = require("mastodon-api");
const { getKey } = require("./modules/auth.js");
const { getData: getChannelData } = require("./modules/channelData.js");
const { getData: getStreamData } = require("./modules/getStreams.js");
const { getData: getLastBroadcastData } = require("./modules/getLastBroadcastData.js");
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

async function postToMastodon(status, skipTimeLimit = false) {
  const currentTime = new Date().getTime();
  const minMillisecondsBetweenPosts = config.minHoursBetweenPosts * 60 * 60 * 1000;

  if (skipTimeLimit || (currentTime - lastPostTime >= minMillisecondsBetweenPosts && sendAnnouncement)) {
    const M = new mastodon({
      access_token: config.mastodonAccessToken,
      api_url: config.mastodonInstance + "/api/v1/"
    });

    M.post("statuses", { status: status }, (error, data) => {
      if (error) {
        console.error(error);
      } else {
        console.log("Post to Mastodon successful!");
        console.log("Posted status:", status); // Add this line to print the posted status
        lastPostTime = currentTime;
        fs.writeFile("lastPostTime.txt", lastPostTime, (err) => {
          if (err) console.error("Error writing lastPostTime to file:", err);
        });
        sendAnnouncement = false;
      }
    });
  } else {
    console.log(`Mastodon post skipped, last post was less than ${config.minHoursBetweenPosts} hours ago.`);
  }
}



function testStartOfStreamMessage(streamTitle) {
  const streamUrl = `https://www.twitch.tv/${config.ChannelName}`;
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  const tootMessage = randomMessage
    .replace("{streamTitle}", streamTitle)
    .replace("{streamUrl}", streamUrl);
  console.log("Test Start of Stream Message:", tootMessage);
}

function testEndOfStreamMessage(streamTitle) {
  const randomEndMessage = config.endOfStreamMessages[Math.floor(Math.random() * config.endOfStreamMessages.length)];
  const endMessage = randomEndMessage.replace("{streamTitle}", streamTitle);
  console.log("Test End of Stream Message:", endMessage);
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

// Add this block to print the fetched stream title when testing
if (config.testStreamTitleFetching) {
  console.log("Fetched stream title:", streamTitle);
}

  // Check if the streamer is live
  if (streamData.data.length === 0) {
    console.log(`${config.ChannelName} is currently offline.`);

    if (prevStreamStatus === "online") {
      const currentTime = new Date().getTime();

      fs.writeFileSync("lastOnlineTime.txt", new Date().getTime());
      console.log("Writing current time to lastOnlineTime.txt");

      fs.writeFileSync("streamStatus.txt", "offline");
      console.log("Writing 'offline' to streamStatus.txt");

      if (config.enableEndOfStreamMessage) {
        const delayBeforeEndOfStreamMessage = config.minutesToWaitBeforeEndOfStreamMessage * 60 * 1000;
        setTimeout(async () => {
          // Get the last broadcast data for the end of stream message
          const lastBroadcastData = await getLastBroadcastData(
            channelData.id,
            config.twitch_clientID,
            authToken
          );
      
          // Use the last stream title for the end of stream message
          const lastStreamTitle = (lastBroadcastData.data[0] && lastBroadcastData.data[0].title) || '';
      
          const randomEndMessage = config.endOfStreamMessages[Math.floor(Math.random() * config.endOfStreamMessages.length)];
          const endMessage = randomEndMessage.replace("{streamTitle}", lastStreamTitle);
          sendAnnouncement = true; // Set sendAnnouncement to true when the stream goes offline
          postToMastodon(endMessage, true); // Set the second argument to true for end of stream messages
        }, delayBeforeEndOfStreamMessage);
      }
      
    }
    
    return;
  } else {
    console.log(`${config.ChannelName} is live!`);
    if (prevStreamStatus === "offline") {
      fs.writeFileSync("streamStatus.txt", "online");
      console.log("Writing 'online' to streamStatus.txt");

      // Post to Mastodon with the stream title and URL
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      const tootMessage = randomMessage
        .replace("{streamTitle}", streamTitle)
        .replace("{streamUrl}", streamUrl);
      postToMastodon(tootMessage);
    }
  }

  if (config.testStartOfStream) {
    testStartOfStreamMessage();
  }
  
  if (config.testEndOfStream) {
    testEndOfStreamMessage();
  }
  
  if (config.testEndOfStream && config.testStreamTitleFetching) {
    const streamTitle = (streamData.data[0] && streamData.data[0].title) || '';
    testEndOfStreamMessage(streamTitle);
  }
  
  if (config.testStartOfStream && config.testStreamTitleFetching) {
    const streamTitle = (streamData.data[0] && streamData.data[0].title) || '';
    testStartOfStreamMessage(streamTitle);
  }  
}




// Check the streamer status every 10 minutes
checkStreamerStatus();
setInterval(checkStreamerStatus, 600000);
