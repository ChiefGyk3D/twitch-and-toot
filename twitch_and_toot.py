import argparse
import configparser
import random
import time
import boto3
import hvac
from datetime import datetime, timedelta
from twitchAPI.twitch import Twitch
from mastodon import Mastodon

class TwitchMastodonBot:
    def __init__(self, config_file, twitch_cred=None, mastodon_cred=None):
        self.config = configparser.ConfigParser()
        self.config.read(config_file)

        if twitch_cred:
            client_id, client_secret = twitch_cred.split(':')
        elif self.config.getboolean('AWS', 'use_secrets_manager', fallback=False):
            secret_name = self.config.get('AWS', 'twitch_secret_name')
            client_id, client_secret = self.get_aws_secret(secret_name).split(':')
        elif self.config.getboolean('Vault', 'use_vault', fallback=False):
            client_id, client_secret = self.get_vault_secret(self.config.get('Vault', 'twitch_secret_path'))
        else:
            client_id = self.config.get('Twitch', 'client_id')
            client_secret = self.config.get('Twitch', 'client_secret')

        self.twitch = Twitch(client_id, client_secret)
        self.twitch.authenticate_app([])

        if mastodon_cred:
            app_name, api_base_url, client_cred, user_cred = mastodon_cred.split(':')
        elif self.config.getboolean('AWS', 'use_secrets_manager', fallback=False):
            secret_name = self.config.get('AWS', 'mastodon_secret_name')
            app_name, api_base_url, client_cred, user_cred = self.get_aws_secret(secret_name).split(':')
        elif self.config.getboolean('Vault', 'use_vault', fallback=False):
            app_name, api_base_url, client_cred, user_cred = self.get_vault_secret(self.config.get('Vault', 'mastodon_secret_path'))
        else:
            app_name = self.config.get('Mastodon', 'app_name')
            api_base_url = self.config.get('Mastodon', 'api_base_url')
            client_id = self.config.get('Mastodon', 'client_id')
            client_secret = self.config.get('Mastodon', 'client_secret')
            access_token = self.config.get('Mastodon', 'access_token')

        Mastodon.create_app(
             app_name,
             api_base_url = api_base_url,
             to_file = client_cred
        )

        self.mastodon = Mastodon(
            client_id = client_cred,
            access_token = user_cred,
            access_token = access_token,
            api_base_url = api_base_url
        )

        self.post_interval = timedelta(hours=int(self.config.get('Settings', 'post_interval')))
        self.last_post_time = datetime.now() - self.post_interval

        with open(self.config.get('Mastodon', 'messages_file'), 'r') as file:
            self.messages = file.read().splitlines()

        with open(self.config.get('Mastodon', 'end_messages_file'), 'r') as file:
            self.end_messages = file.read().splitlines()
    
    def get_aws_secret(self, secret_name):
        session = boto3.session.Session()
        client = session.client(service_name='secretsmanager')
        get_secret_value_response = client.get_secret_value(SecretId=secret_name)
        return get_secret_value_response['SecretString']

    def is_user_live(self, user_login):
        user_info = self.twitch.get_users(logins=[user_login])
        user_id = user_info['data'][0]['id']
        streams = self.twitch.get_streams(user_id=user_id)
        live_streams = [stream for stream in streams['data'] if stream['type'] == 'live']
        if live_streams:
            return live_streams[0]['title']
        return None
    
    def get_vault_secret(self, path):
        client = hvac.Client(url=self.config.get('Vault', 'url'), token=self.config.get('Vault', 'token'))
        secret = client.read(path)['data']
        return secret['client_id'], secret['client_secret'], secret['app_name'], secret['api_base_url'], secret['client_cred'], secret['user_cred']


    def post_message(self, stream_title):
        if (datetime.now() - self.last_post_time) >= self.post_interval:
            message = random.choice(self.messages).format(stream_title=stream_title)
            self.mastodon.toot(message)
            self.last_post_time = datetime.now()
    
    def post_end_stream_message(self):
        if (datetime.now() - self.last_stream_time) <= self.stream_end_interval:
            end_message = random.choice(self.end_messages)
            self.mastodon.toot(end_message)    

    def monitor_and_post(self):
        user_login = self.config.get('Twitch', 'user_login')
        
        while True:
            stream_title = self.is_user_live(user_login)
            if stream_title is not None:
                self.post_message(stream_title)
            time.sleep(int(self.config.get('Settings', 'check_interval')) * 60)

def main():
    parser = argparse.ArgumentParser(description='A bot to post on Mastodon when a Twitch user goes live.')
    parser.add_argument('-c', '--config', type=str, required=True, help='Path to the config file.')
    parser.add_argument('-t', '--twitch-cred', type=str, help='Twitch credentials (format: client_id:client_secret).')
    parser.add_argument('-m', '--mastodon-cred', type=str, help='Mastodon credentials (format: app_name:api_base_url:client_cred:user_cred).')
    args = parser.parse_args()

    bot = TwitchMastodonBot(args.config, twitch_cred=args.twitch_cred, mastodon_cred=args.mastodon_cred)
    bot.monitor_and_post()

if __name__ == "__main__":
    main()
