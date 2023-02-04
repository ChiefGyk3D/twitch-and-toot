import requests

# Twitch API client ID
client_id = "your_twitch_api_client_id"
# Twitch channel name
channel_name = "your_twitch_channel_name"

url = f"https://api.twitch.tv/helix/users?login={channel_name}"
headers = {"Client-ID": client_id}
response = requests.get(url, headers=headers)
if response.status_code != 200:
    print(f"An error occurred while getting the channel ID: {response.text}")
else:
    data = response.json()
    channel_id = data["data"][0]["id"]
    print(f"The channel ID for {channel_name} is {channel_id}")
