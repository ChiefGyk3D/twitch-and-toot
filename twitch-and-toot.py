from twitchAPI.twitch import Twitch
from mastodon import Mastodon
import time
import configparser
import random
import hvac
import boto3
import tweepy
import os

# Load the configuration file
config = configparser.ConfigParser()
config.read('config.ini')

# Get environment variable or from config.ini if not available
def get_config(section, key):
    return os.getenv(f'{section.upper()}_{key.upper()}', config.get(section, key))

# Get boolean environment variable or from config.ini if not available
def get_bool_config(section, key):
    env_var = os.getenv(f'{section.upper()}_{key.upper()}')
    if env_var is not None:
        return env_var.lower() in ['true', '1', 't', 'y', 'yes']
    else:
        return config.getboolean(section, key)

# Get integer environment variable or from config.ini if not available
def get_int_config(section, key):
    env_var = os.getenv(f'{section.upper()}_{key.upper()}')
    if env_var is not None:
        return int(env_var)
    else:
        return config.getint(section, key)

def get_secret(secret_name, source='aws'):
    if source == 'aws':
        # Create a Secrets Manager client
        session = boto3.session.Session()
        client = session.client(service_name='secretsmanager')
        get_secret_value_response = client.get_secret_value(SecretId=secret_name)
        secret = get_secret_value_response['SecretString']
    elif source == 'vault':
        vault_url = get_config('Secrets', 'vault_url')
        vault_token = get_config('Secrets', 'vault_token')
        client = hvac.Client(url=vault_url, token=vault_token)
        secret = client.read(secret_name)['data']['data']
    return secret

# Secret Manager setup
secret_manager = get_config('Secrets', 'secret_manager')

# Twitch API setup
twitch_client_id = get_config('Twitch', 'client_id')
twitch_client_secret = get_config('Twitch', 'client_secret')
twitch_user_login = get_config('Twitch', 'user_login')
twitch = Twitch(twitch_client_id, twitch_client_secret)
twitch.authenticate_app([])
print("Successfully authenticated with Twitch API")

# Mastodon API setup
mastodon_client_id = get_config('Mastodon', 'client_id')
mastodon_client_secret = get_config('Mastodon', 'client_secret')
mastodon_access_token = get_config('Mastodon', 'access_token')
mastodon_api_base_url = get_config('Mastodon', 'api_base_url')
messages_file = get_config('Mastodon', 'messages_file')
end_messages_file = get_config('Mastodon', 'end_messages_file')
post_end_stream_message = get_bool_config('Mastodon', 'post_end_stream_message')

mastodon = Mastodon(
    client_id=mastodon_client_id,
    client_secret=mastodon_client_secret,
    access_token=mastodon_access_token,
    api_base_url=mastodon_api_base_url
)
print("Successfully authenticated with Mastodon API")

# Twitter API setup
twitter_consumer_key = get_config('Twitter', 'consumer_key')
twitter_consumer_secret = get_config('Twitter', 'consumer_secret')
twitter_access_token = get_config('Twitter', 'access_token')
twitter_access_token_secret = get_config('Twitter', 'access_token_secret')
twitter_enable_posting = get_bool_config('Twitter', 'enable_posting')

# Initialize the Twitter API object
auth = tweepy.OAuthHandler(twitter_consumer_key, twitter_consumer_secret)
auth.set_access_token(twitter_access_token, twitter_access_token_secret)
twitter_api = tweepy.API(auth)
print("Successfully authenticated with Twitter API")

# Load secrets from secret manager if configured
if secret_manager:
    if secret_manager.lower() == 'aws':
        twitch_secret_name = config.get('Secrets', 'aws_twitch_secret_name')
        mastodon_secret_name = config.get('Secrets', 'aws_mastodon_secret_name')
        twitter_secret_name = config.get('Secrets', 'aws_twitter_secret_name')
        twitch_secret = get_secret(twitch_secret_name, source='aws')
        mastodon_secret = get_secret(mastodon_secret_name, source='aws')
        twitter_secret = get_secret(twitter_secret_name, source='aws')
        twitch_client_id = twitch_secret['client_id']
        twitch_client_secret = twitch_secret['client_secret']
        mastodon_client_id = mastodon_secret['client_id']
        mastodon_client_secret = mastodon_secret['client_secret']
        mastodon_access_token = mastodon_secret['access_token']
        twitter_consumer_key = twitter_secret['consumer_key']
        twitter_consumer_secret = twitter_secret['consumer_secret']
        twitter_access_token = twitter_secret['access_token']
        twitter_access_token_secret = twitter_secret['access_token_secret']
    elif secret_manager.lower() == 'vault':
        twitch_secret_path = config.get('Secrets', 'vault_twitch_secret_path')
        mastodon_secret_path = config.get('Secrets', 'vault_mastodon_secret_path')
        twitter_secret_path = config.get('Secrets', 'vault_twitter_secret_path')
        twitch_secret = get_secret(twitch_secret_path, source='vault')
        mastodon_secret = get_secret(mastodon_secret_path, source='vault')
        twitter_secret = get_secret(twitter_secret_path, source='vault')
        twitch_client_id = twitch_secret['client_id']
        twitch_client_secret = twitch_secret['client_secret']
        mastodon_client_id = mastodon_secret['client_id']
        mastodon_client_secret = mastodon_secret['client_secret']
        mastodon_access_token = mastodon_secret['access_token']
        twitter_consumer_key = twitter_secret['consumer_key']
        twitter_consumer_secret = twitter_secret['consumer_secret']
        twitter_access_token = twitter_secret['access_token']
        twitter_access_token_secret = twitter_secret['access_token_secret']

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

def post_tweet(message):
    if twitter_enable_posting:
        twitter_api.update_status(message)
        print(f"Posted tweet: {message}")

def post_message(message):
    mastodon.toot(message)
    print(f"Posted message: {message}")

was_live = False

start_time = None

while True:
    print("Checking if user is live...")
    stream_title = is_user_live(twitch_user_login)
    if stream_title is not None:
        print(f"User is live, playing: {stream_title}")
        if not was_live:
            message = random.choice(messages).format(stream_title=stream_title, twitch_user_login=twitch_user_login)
            post_message(message)
            post_tweet(message)
            was_live = True
            start_time = time.time()  # Save the time when the stream started
        print(f"Waiting for {get_int_config('Settings', 'post_interval')} hours before checking again...")
        time.sleep(get_int_config('Settings', 'post_interval') * 60 * 60)  # Wait for specified hours before checking again
    else:
        if was_live and post_end_stream_message:  # If the stream was live in the last check, post the end-of-stream message
            # Only post the end-of-stream message if enough time has passed since the start of the stream
            if time.time() - start_time >= get_int_config('Settings', 'end_message_delay') * 60 * 60:
                message = random.choice(end_messages).format(twitch_user_login=twitch_user_login)
                post_message(message)
                post_tweet(message)
                was_live = False
        print(f"User is not live, checking again in {get_int_config('Settings', 'check_interval')} minutes...")
        time.sleep(get_int_config('Settings', 'check_interval') * 60)  # Wait for specified minutes before checking again
