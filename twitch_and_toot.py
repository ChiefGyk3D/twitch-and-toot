import sys
import requests
import random
import time

def is_live(channel_name):
    # Function to check if the channel is live
    url = f"https://api.twitch.tv/helix/streams?user_login={channel_name}"
    headers = {
        "Client-ID": "<YOUR_TWITCH_CLIENT_ID>"
    }
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        if data["data"]:
            return True
        else:
            return False
    else:
        print("An error occurred while checking the stream status.")
        sys.exit(1)

def toot(status):
    # Function to post a toot to Mastodon
    access_token = "<YOUR_MASTODON_ACCESS_TOKEN>"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    payload = {
        "status": status,
        "visibility": "unlisted"
    }
    response = requests.post("https://<YOUR_MASTODON_INSTANCE>/api/v1/statuses", headers=headers, json=payload)
    if response.status_code == 200:
        print(f"Tooted: {status}")
    else:
        print("An error occurred while tooting.")
        sys.exit(1)

if __name__ == "__main__":
    channel_name = "ChiefGyk3D"
    live_messages = [
        "ChiefGyk3D is now live on Twitch! Come join the fun!",
        "Streaming live now on Twitch with ChiefGyk3D!",
        "Let's get this party started with ChiefGyk3D's live stream on Twitch!",
        "Time to tune in to ChiefGyk3D's live stream on Twitch!"
    ]
    end_messages = [
        "Thanks for tuning in to ChiefGyk3D's stream on Twitch!",
        "That was a great stream by ChiefGyk3D on Twitch! See you next time!",
        "Until next time, farewell from ChiefGyk3D's stream on Twitch!",
        "ChiefGyk3D's stream on Twitch has ended. See you soon!"
    ]
    while True:
        if is_live(channel_name):
            toot(random.choice(live_messages))
            while is_live(channel_name):
                time.sleep(60)
        else:
            toot(random.choice(end_messages))
            time.sleep(60)
