const request = require('request');
const Masto = require('mastodon');
const auth = require('./auth');
const channelData = require('./channelData');
const getStreams = require('./getStreams');

const clientID = 'YOUR_TWITCH_CLIENT_ID';
const clientSecret = 'YOUR_TWITCH_CLIENT_SECRET';
const channelName = 'YOUR_TWITCH_CHANNEL_NAME';

const mastodonInstance = 'YOUR_MASTODON_INSTANCE_URL';
const mastodonAccessToken = 'YOUR_MASTODON_ACCESS_TOKEN';

const masto = new Masto({
  access_token: mastodonAccessToken,
  api_url: mastodonInstance + '/api/v1/'
});

async function checkLiveStatus() {
  try {
    const twitchAuthKey = await auth.getKey(clientID, clientSecret);
    const channelData = await getChannelData(channelName, clientID, twitchAuthKey);
    if (!channelData) {
      console.log(`Channel ${channelName} not found on Twitch`);
      return;
    }
    const streamsData = await getStreams.getData(channelName, clientID, twitchAuthKey);
    if (!streamsData.data.length) {
      console.log(`Channel ${channelName} is not live on Twitch`);
      return;
    }
    console.log(`Channel ${channelName} is live on Twitch`);
    const message = `@${channelName} is now live on Twitch! Go check it out!`;
    masto.post('statuses', { status: message }).then(resp => {
      console.log(`Successfully posted to Mastodon: ${message}`);
    }).catch(err => {
      console.error(`Failed to post to Mastodon: ${err}`);
    });
  } catch (err) {
    console.error(err);
  }
}

setInterval(checkLiveStatus, 60000); // refresh status every 60 seconds
