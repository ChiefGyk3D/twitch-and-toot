export async function getKey(clientID, clientSecret) {
    const response = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${clientID}&client_secret=${clientSecret}&grant_type=client_credentials`);
    return response.json().access_token;
}
