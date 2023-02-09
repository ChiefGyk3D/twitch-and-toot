export async function getData(channelName, clientID,authkey) {
    let response = await fetch(`https://api.twitch.tv/helix/streams?user_login=${channelName}`,
        headers: {
            "client-id": clientID,
            "authorization": `Bearer ${authKey}`
        }
    );
    return response.json();
}
