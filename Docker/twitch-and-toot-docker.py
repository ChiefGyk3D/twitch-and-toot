from twitchAPI.twitch import Twitch
from mastodon import Mastodon
import time
import configparser
import random
import hvac
import boto3
import os

# Load the configuration file
config = configparser.ConfigParser()
config.read('/app/config/config.ini')

def get_secret(secret_name, source='aws'):
    if source == 'aws':
        # Create a Secrets Manager client
        session = boto3.session.Session()
        client = session.client(service_name='secretsmanager')

        get_secret_value_response = client.get_secret_value(SecretId=secret_name)
        secret = get_secret_value_response['SecretString']

    elif source == 'vault':
        client = hvac.Client(url='https://your-vault-server.com', token='your-vault-token')
        secret = client.read(secret_name)['data']['data']

    return secret

# Twitch API setup
twitch_client_id = os.getenv('TWITCH_CLIENT_ID')
twitch_client_secret = os.getenv('TWITCH_CLIENT_SECRET')
twitch_user_login = os.getenv('TWITCH_USER_LOGIN')

# Mastodon API setup
mastodon_client_id = os.getenv('MASTODON_CLIENT_ID')
mastodon_client_secret = os.getenv('MASTODON_CLIENT_SECRET')
mastodon_access_token = os.getenv('MASTODON_ACCESS_TOKEN')
mastodon_api_base_url = os.getenv('MASTODON_API_BASE_URL')
messages_file = os.getenv('MESSAGES_FILE', 'messages.txt')
end_messages_file = os.getenv('END_MESSAGES_FILE', 'end_messages.txt')
post_end_stream_message = os.getenv('POST_END_STREAM_MESSAGE', 'True') == 'True'

# Secret Manager setup
secret_manager = os.getenv('SECRET_MANAGER')

# Load secrets from secret manager if configured
if secret_manager:
    if secret_manager.lower() == 'aws':
        twitch_secret_name = config.get('Secrets', 'aws_twitch_secret_name')
        mastodon_secret_name = config.get('Secrets', 'aws_mastodon_secret_name')
        twitch_secret = get_secret(twitch_secret_name, source='aws')
        mastodon_secret = get_secret(mastodon_secret_name, source='aws')

        # Now replace the client id and secret from config file with the secrets from Secret Manager
        twitch_client_id = twitch_secret['client_id']
        twitch_client_secret = twitch_secret['client_secret']
        mastodon_client_id = mastodon_secret['client_id']
        mastodon_client_secret = mastodon_secret['client_secret']
        mastodon_access_token = mastodon_secret['access_token']

    elif secret_manager.lower() == 'vault':
        twitch_secret_path = config.get('Secrets', 'vault_twitch_secret_path')
        mastodon_secret_path = config.get('Secrets', 'vault_mastodon_secret_path')
        twitch_secret = get_secret(twitch_secret_path, source='vault')
        mastodon_secret = get_secret(mastodon_secret_path, source='vault')

        # Now replace the client id and secret from config file with the secrets from Secret Manager
        twitch_client_id = twitch_secret['client_id']
        twitch_client_secret = twitch_secret['client_secret']
        mastodon_client_id = mastodon_secret['client_id']
        mastodon_client_secret = mastodon_secret['client_secret']
        mastodon_access_token = mastodon_secret['access_token']

twitch = Twitch(twitch_client_id, twitch_client_secret)
twitch.authenticate_app([])
print("Successfully authenticated with Twitch API")

mastodon = Mastodon(
    client_id=mastodon_client_id,
    client_secret=mastodon_client_secret,
    access_token=mastodon_access_token,
    api_base_url=mastodon_api_base_url
)

print("Successfully authenticated with Mastodon API")

# Load the messages from the file
with open(messages_file, 'r') as file:
    messages = file.read().splitlines()

# Load the end of stream messages from the file
with open(end_messages_file, 'r') as file:
    end_messages = file.read().splitlines()

def is_user_live(user_login):
    user_info = twitch.get_users(logins=[user_login])
    user_id = user_info['data'][0]['id']
    streams = twitch.get_streams(user_id=user_id)
    live_streams = [stream for stream in streams['data'] if stream['type'] == 'live']
    return live_streams[0]['title'] if live_streams else None

def post_message(message):
    mastodon.toot(message)
    print(f"Posted message: {message}")

was_live = False

while True:
    print("Checking if user is live...")
    stream_title = is_user_live(twitch_user_login)
    
    if stream_title is not None:
        print(f"User is live, playing: {stream_title}")
        if not was_live:
            message = random.choice(messages).format(stream_title=stream_title, twitch_user_login=twitch_user_login)
            post_message(message)
            was_live = True
        print(f"Waiting for {config.getint('Settings', 'post_interval')} hours before checking again...")
        time.sleep(config.getint('Settings', 'post_interval') * 60 * 60)  # Wait for specified hours before checking again
    else:
        if was_live and post_end_stream_message:  # If the stream was live in the last check, post the end-of-stream message
            message = random.choice(end_messages).format(twitch_user_login=twitch_user_login)
            post_message(message)
            was_live = False
        print(f"User is not live, checking again in {config.getint('Settings', 'check_interval')} minutes...")
        time.sleep(config.getint('Settings', 'check_interval') * 60)  # Wait for specified minutes before checking again
