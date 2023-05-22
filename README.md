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

### Caution

While the above example demonstrates how to configure the bot with secrets directly placed into the config.ini file, this is not a recommended practice for production environments. It is highly suggested to use services like HashiCorp Vault or AWS Secrets Manager to handle secrets more securely.

If you still prefer to put your secrets into config.ini, ensure that this file is appropriately secured and never committed into a public repository.

The Twitch-Mastodon Bot supports the use of both AWS Secrets Manager and HashiCorp Vault. Please see the following sections for how to configure them.

## AWS Secrets Manager Integration

The script supports optional integration with AWS Secrets Manager for secure storage and retrieval of Twitch and Mastodon API keys. To use this feature, store the credentials as secrets in AWS Secrets Manager and provide the secret names in the config.ini file.

**Please note that this feature is still in testing and any issues should be reported.**

## HashiCorp Vault Integration

The script also supports optional integration with HashiCorp Vault for secure storage and retrieval of Twitch and Mastodon API keys. To use this feature, store the credentials in Vault and provide the necessary Vault information in the config.ini file.

**Please note that this feature is still in testing and any issues should be reported.**

## Future plans
    
- Dockerize the script for easy deployment and scaling.
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
