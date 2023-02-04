const TwitchApi = require("twitch-api");
const Mastodon = require("mastodon-api");

// setup Twitch API with client ID and OAuth token
const twitch = new TwitchApi({
  clientId: process.env.TWITCH_CLIENT_ID,
  accessToken: process.env.TWITCH_OAUTH_TOKEN
});

// setup Mastodon API with access token
const mastodon = new Mastodon({
  access_token: process.env.MASTODON_ACCESS_TOKEN,
  api_url: "https://mastodon.social/api/v1/"
});

// array of messages to post to Mastodon when streamer is live
const messages = [
  "Streaming live on Twitch now! Check it out!",
  "Come join the live stream party on Twitch!",
  "It's a good day to watch a live stream on Twitch. Tune in!",
  "Streaming live on Twitch, don't miss it!",
  "Twitch streaming time, let's go!"
];

// function to post a random message to Mastodon
function postToMastodon(streamer) {
  let randomMessage = messages[Math.floor(Math.random() * messages.length)];
  mastodon.post("statuses", { status: `@${streamer} ${randomMessage}` }, function(err, data) {
    if (err) console.error(err);
    else console.log(`Successfully posted to Mastodon: ${randomMessage}`);
  });
}

// function to refresh Twitch OAuth token
function refreshTwitchToken() {
  twitch.refreshToken(process.env.TWITCH_REFRESH_TOKEN, function(err, data) {
    if (err) console.error(err);
    else {
      console.log("Successfully refreshed Twitch OAuth token");
      process.env.TWITCH_OAUTH_TOKEN = data.access_token;
    }
  });
}

// check if streamer is live every 10 minutes
setInterval(function() {
  const streamer = "example_streamer";
  twitch.streams.live({ channel: streamer }, function(err, data) {
    if (err) {
      console.error(err);
      refreshTwitchToken();
    } else {
      if (data.stream) {
        console.log(`${streamer} is live!`);
        postToMastodon(streamer);
      } else {
        console.log(`${streamer} is not live.`);
      }
    }
  });
}, 600000);
