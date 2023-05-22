# Twitch-and-toot

Twitch-and-toot is an open source project that allows you to post to Mastodon when a streamer is live on Twitch. It's now built on Python and can run on a RaspberryPi, Single Board Computer, Linux VPS, AWS Lambda, or a private server.

## Requirements and Prerequisites

- Python 3 installed on the device that you plan to run the script on.
- A Twitch API key (client ID and secret) which can be obtained from the Twitch Developer Dashboard.
- A Mastodon API key (access token) which can be obtained from your Mastodon instance.

## Installation

1. Clone the Github repository to your device: `git clone https://github.com/ChiefGyk3D/twitch-and-toot.git`
2. Install the required packages: `pip install -r requirements.txt`
3. Create a `config.ini` file based on the `config_template.ini` file in the repository. Fill in the required information such as Twitch API key, Mastodon API key, and the channel name you want to track, messages, and any other changes needed.
4. Run the script: `python twitch-and-toot.py`

## Configuration

The config.ini file is used to store the required information such as the Twitch API key, Mastodon API key, and the channel name you want to track. You can also customize the messages that will be posted to Mastodon when the streamer is live and when the stream has ended. These messages are stored in separate text files and are referenced in the config.ini.

Here's an example structure for the config.ini file:

```ini
[Twitch]
client_id = YOUR_TWITCH_CLIENT_ID
client_secret = YOUR_TWITCH_CLIENT_SECRET
user_login = YOUR_TWITCH_USERNAME

[Mastodon]
app_name = YOUR_APP_NAME
api_base_url = YOUR_INSTANCE_URL
client_id = YOUR_CLIENT_ID
client_secret = YOUR_CLIENT_SECRET
access_token = YOUR_ACCESS_TOKEN
messages_file = MESSAGES_FILE_PATH
end_messages_file = END_MESSAGES_FILE_PATH
post_end_stream_message = BOOLEAN_VALUE

[Secrets]
secret_manager = YOUR_SECRET_MANAGER_TYPE 
aws_twitch_secret_name = YOUR_TWITCH_SECRET_NAME_IN_AWS_SECRETS_MANAGER
aws_mastodon_secret_name = YOUR_MASTODON_SECRET_NAME_IN_AWS_SECRETS_MANAGER
vault_url = YOUR_VAULT_URL
vault_token = YOUR_VAULT_TOKEN
vault_twitch_secret_path = YOUR_TWITCH_SECRET_PATH_IN_VAULT
vault_mastodon_secret_path = YOUR_MASTODON_SECRET_PATH_IN_VAULT

[Settings]
post_interval = YOUR_PREFERRED_POST_INTERVAL_IN_HOURS
check_interval = YOUR_PREFERRED_CHECK_INTERVAL_IN_MINUTES
```
Please note, the config.ini should be modified to match your needs.

## Twitter Integration

While Twitch-and-toot is fundamentally a Mastodon-first project, we understand that some users may also want to post updates on Twitter. As of the current version, we have incorporated optional Twitter functionality. This feature allows users to post live stream updates not only on Mastodon but also on Twitter.

**Please note, as of the current version, Twitter functionality has not been added to the Docker version yet.**

# Requirements for Twitter Integration

To use the Twitter feature, you would need:

    Twitter API keys (API key & secret, Access token & secret). You can obtain these from the Twitter Developer Dashboard.

# Adding Twitter Integration

The process to add Twitter integration is similar to that of Mastodon. In the config.ini file, a new section needs to be added for Twitter configuration.

```ini
[Twitter]
api_key = YOUR_TWITTER_API_KEY
api_key_secret = YOUR_TWITTER_API_KEY_SECRET
access_token = YOUR_TWITTER_ACCESS_TOKEN
access_token_secret = YOUR_TWITTER_ACCESS_TOKEN_SECRET
```

Again, please be careful not to commit your config.ini with sensitive information to a public repository.

Now, when you run python twitch-and-toot.py, it should post updates to both Mastodon and Twitter, if correctly configured.
### Caution

As stated before, placing secrets directly into the config.ini file is not a recommended practice for production environments. We are currently working on supporting secure storage and retrieval of Twitter API keys with AWS Secrets Manager and HashiCorp Vault. Please stay tuned for updates.

Moreover, please remember that this is an optional feature and Mastodon remains the primary focus of Twitch-and-toot. The addition of Twitter is intended to offer greater flexibility to our users and is not a shift from our Mastodon-first philosophy. If you experience any issues with the Twitter integration, please feel free to report them.

## AWS Secrets Manager Integration

The script supports optional integration with AWS Secrets Manager for secure storage and retrieval of Twitch and Mastodon API keys. To use this feature, store the credentials as secrets in AWS Secrets Manager and provide the secret names in the config.ini file.

**Please note that this feature is still in testing and any issues should be reported.**

## HashiCorp Vault Integration

The script also supports optional integration with HashiCorp Vault for secure storage and retrieval of Twitch and Mastodon API keys. To use this feature, store the credentials in Vault and provide the necessary Vault information in the config.ini file.

**Please note that this feature is still in testing and any issues should be reported.**

# Docker 

Twitch-and-toot is also available to be run in a Docker container. This can make the setup process easier and more consistent across different environments. It also allows for better scalability if you are running the bot for multiple Twitch channels.

## Requirements and Prerequisites for Docker

- Docker installed on your device.
- Docker Compose installed on your device (optional, only needed for docker-compose).

## Docker Installation

1. Navigate to the Docker directory in the project: `cd twitch-and-toot/Docker`
2. Build the Docker image: `docker build -t twitch-and-toot .`

If you are using Docker Compose, you can instead run:

`docker-compose up --build`

This will build and start the Docker container in one command.

## Docker Configuration

Configuration in Docker is done using environment variables instead of a `config.ini` file. These can be passed into the Docker container using the `-e` option with `docker run`:

`docker run -e TWITCH_CLIENT_ID=your_client_id -e TWITCH_CLIENT_SECRET=your_client_secret ... twitch-and-toot`

If you are using Docker Compose, you can put these variables into the `docker-compose.yml` file:

```yaml
version: '3'

services:
  twitch-and-toot:
    build: .
    environment:
      TWITCH_CLIENT_ID: your_client_id
      TWITCH_CLIENT_SECRET: your_client_secret
      TWITCH_USER_LOGIN: your_user_login
      MASTODON_CLIENT_ID: your_client_id
      MASTODON_CLIENT_SECRET: your_client_secret
      MASTODON_ACCESS_TOKEN: your_access_token
      MASTODON_API_BASE_URL: your_api_base_url
      MESSAGES_FILE: messages.txt
      END_MESSAGES_FILE: end_messages.txt
      POST_END_STREAM_MESSAGE: 'True'
      SECRET_MANAGER: your_secret_manager
      AWS_TWITCH_SECRET_NAME: your_aws_twitch_secret_name
      AWS_MASTODON_SECRET_NAME: your_aws_mastodon_secret_name
      VAULT_URL: your_vault_url
      VAULT_TOKEN: your_vault_token
      VAULT_TWITCH_SECRET_PATH: your_vault_twitch_secret_path
      VAULT_MASTODON_SECRET_PATH: your_vault_mastodon_secret_path
      POST_INTERVAL_IN_HOURS: your_post_interval_in_hours
      CHECK_INTERVAL_IN_MINUTES: your_check_interval_in_minutes
```
These environment variables correspond to the options in the config.ini file.

Please note: If you are using a secrets manager with Docker, you will need to set up a network that allows the Docker container to access the secrets manager.

Remember to replace the necessary values with your actual data.
## Future plans

- Add support for more streaming platforms.

## Donations and Tips

If you would like to support the development of Twitch-and-toot, you can donate through the following links: [Donate](https://links.chiefgyk3d.com)

You can also tip the author with the following cryptocurrency addresses:

- Bitcoin: bc1q5grpa7ramcct4kjmwexfrh74dvjuw9wczn4w2f
- Monero: 85YxVz8Xd7sW1xSiyzUC5PNqSjYLYk4W8FMERVkvznR38jGTBEViWQSLCnzRYZjmxgUkUKGhxTt2JSFNpJuAqghQLhHgPS5
- PIVX: DS1CuBQkiidwwPhkfVfQAGUw4RTWPnBXVM
- Ethereum: 0x2a460d48ab404f191b14e9e0df05ee829cbf3733

## Authors

- ChiefGyk3D is the author of Twitch-and-toot
- [ChiefGyk3D's Mastodon Account](https://social.chiefgyk3d.com/@chiefgyk3d)
- ChatGPT, an AI developed by OpenAI, helped build about 80% of the Python version of Twitch-and-toot.
