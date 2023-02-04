import requests
import time
import logging
import random
from mastodon import Mastodon

# Set up logging
logging.basicConfig(filename='live_notifications.log', level=logging.INFO,
                    format='%(asctime)s:%(levelname)s:%(message)s')

# Variables
TWITCH_API_URL = "https://api.twitch.tv/helix/streams?user_login=chiefgyk3d"
TWITCH_HEADERS = {
    "Client-ID": "your_client_id_here"
}

# Mastodon instance and login credentials
mastodon = Mastodon(
    client_id="your_client_id_here",
    client_secret="your_client_secret_here",
    access_token="your_access_token_here",
    api_base_url="your_mastodon_instance_url_here"
)

# Random messages to post when ChiefGyk3D goes live
random_messages = [
    "ChiefGyk3D is now live on Twitch! Check out the stream: https://twitch.tv/chiefgyk3d",
    "Get ready for some gaming with ChiefGyk3D! He's now live on Twitch: https://twitch.tv/chiefgyk3d",
    "It's time to watch some gaming with ChiefGyk3D! He's now live on Twitch: https://twitch.tv/chiefgyk3d",
    "ChiefGyk3D is streaming now! Don't miss out: https://twitch.tv/chiefgyk3d",
    "ChiefGyk3D just started a new stream! Check it out: https://twitch.tv/chiefgyk3d"
]

# Function to check if ChiefGyk3D is live on Twitch
def is_live():
    response = requests.get(TWITCH_API_URL, headers=TWITCH_HEADERS)
    if response.status_code == 200:
        data = response.json()
        if data["data"]:
            return True
        else:
            return False
    else:
        logging.error("Failed to retrieve data from Twitch API")
        return False

# Function to post to Mastodon when ChiefGyk3D goes live
def post_to_mastodon(message):
    try:
        mastodon.status_post(status=message, visibility='public')
        logging.info("Successfully posted to Mastodon")
    except Exception as e:
        logging.error("Failed to post to Mastodon: " + str(e))

# Main loop to check if ChiefGyk3D is live and post to Mastodon if he is
while True:
    if is_live():
        post_to_mastodon(random.choice(random_messages))
        break
    else:
        time.sleep(30)
        logging.info("Checking if ChiefGyk3D is live...")
