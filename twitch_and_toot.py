import sys
import requests
import time
import random

# Twitch API client ID
client_id = "your_twitch_api_client_id"
# Twitch channel ID
channel_id = "your_twitch_channel_id"

# Live messages to post to Mastodon
live_messages = [
    "ChiefGyk3D is now live on Twitch! Come join the fun! #ChiefGyk3D #Twitch",
    "It's time to get your game on! ChiefGyk3D is now live! #ChiefGyk3D #Twitch",
    "The stream is now live! Don't miss out on the action with ChiefGyk3D! #ChiefGyk3D #Twitch"
]

# Offline messages to post to Mastodon
offline_messages = [
    "Thanks for tuning in to ChiefGyk3D's stream! See you next time! #ChiefGyk3D #Twitch",
    "That's a wrap! Thanks for joining ChiefGyk3D's stream. Until next time! #ChiefGyk3D #Twitch",
    "ChiefGyk3D's stream has ended. See you next time for more fun and games! #ChiefGyk3D #Twitch"
]

# Mastodon API access token
access_token = "your_mastodon_api_access_token"
# Mastodon instance URL
instance_url = "https://your.mastodon.instance"

def post_toot(status):
    url = f"{instance_url}/api/v1/statuses"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    data = {
        "status": status,
        "visibility": "public"
    }
    response = requests.post(url, headers=headers, json=data)
    if response.status_code != 200:
        print(f"An error occurred while posting the toot: {response.text}")
    else:
        print(f"Successfully posted toot: {status}")

while True:
    # Check the status of the Twitch stream
    url = f"https://api.twitch.tv/helix/streams?user_id={channel_id}"
    headers = {"Client-ID": client_id}
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        print(f"An error occurred while checking the stream status: {response.text}")
    else:
        data = response.json()
        if data["data"]:
            # The channel is live, post a random live message to Mastodon
            status = random.choice(live_messages)
            post_toot(status)
        else:
            # The channel is offline, post a random offline message to Mastodon
            status = random.choice(offline_messages)
            post_toot(status)
    # Wait for a while before checking the status again
    time.sleep(60)
