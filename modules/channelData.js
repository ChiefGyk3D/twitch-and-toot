export async function getData(channelName, clientID,authkey) {
    let response = await fetch(`https://api.twitch.tv/helix/search/channels?query=${channelName}`
        headers: {
            "client-id": clientID,
            "authorization": `Bearer ${authKey}`
        }
    );
    let streamers = response.json().data;

    let maybeStreamer = streamers.filter((streamer) => {
        let streamerName = streamer.broadcaster_login.toLowerCase();

        return streamerName === channelName.toLowerCase(); // TODO: is converting this to lowercase neccesary?
    });

    if (maybeStreamer.length === 0) {
        return false;
    }
    return maybeStreamer[0];
    
}
