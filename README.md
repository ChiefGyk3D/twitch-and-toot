# Twitch-and-toot
## Currently in testing! Report any issues as this is not yet Stable

Twitch-and-toot is an open source project that allows you to post to Mastodon when a streamer is live on Twitch. It's now built on Python and can run on a RaspberryPi, Single Board Computer, Linux VPS, AWS Lambda, or a private server.

## Requirements and Prerequisites

- Python 3 installed on the device that you plan to run the script on.
- A Twitch API key (client ID and secret) which can be obtained from the Twitch Developer Dashboard.
- A Mastodon API key (access token) which can be obtained from your Mastodon instance.

## Installation

1. Clone the Github repository to your device: `git clone https://github.com/ChiefGyk3D/twitch-and-toot.git`
2. Install the required packages: `pip install -r requirements.txt`
3. Create a `config.ini` file based on the `config_template.ini` file in the repository. Fill in the required information such as Twitch API key, Mastodon API key, and the channel name you want to track, messages, and any other changes needed.
4. Run the script: `python twitch_and_toot.py -c config.ini`

## Configuration

The configuration file `config.ini` is used to store the required information such as Twitch API key, Mastodon API key, and the channel name you want to track.

You can also customize the messages that will be posted to Mastodon when the streamer is live as well as when the stream has ended. These messages are stored in separate text files and referenced in the `config.ini`. Each message should be on a new line in the text file.

You can customize the number of hours between Mastodon posts allowed per stream, by default it is set to every 6 hours. But feel free to adjust this to any whole number you prefer.
You can customize the number of minutes after a stream has ended to make an end of stream post, as well as if you want end of stream messages enabled at all.

An example structure for the `config.ini` file is as follows:

```ini
[Twitch]
client_id = your_client_id
client_secret = your_client_secret
user_login = the_twitch_user_you_want_to_monitor

[Mastodon]
app_name = your_app_name
api_base_url = https://your-instance.com
client_id = your_client_id
client_secret = your_client_secret
access_token = your_access_token
messages_file = path_to_your_messages_file
end_messages_file = path_to_your_end_messages_file

[Settings]
post_interval = hours_between_each_post
check_interval = minutes_between_each_check
```

### Caution

While the above example demonstrates how to configure the bot with secrets directly placed into the config.ini file, this is not a recommended practice for production environments. It is highly suggested to use services like HashiCorp Vault or AWS Secrets Manager to handle secrets more securely.

If you still prefer to put your secrets into config.ini, ensure that this file is appropriately secured and never committed into a public repository.

The Twitch-Mastodon Bot supports the use of both AWS Secrets Manager and HashiCorp Vault. Please see the following sections for how to configure them.

## AWS Secrets Manager Integration

The script supports optional integration with AWS Secrets Manager. This allows for secure storage and retrieval of the Twitch and Mastodon API credentials. If you want to use this feature, you will need to store the credentials as secrets in AWS Secrets Manager and provide the secret names in the `config.ini` file.

## HashiCorp Vault Integration

The script also supports optional integration with HashiCorp Vault for secure storage and retrieval of the Twitch and Mastodon API credentials. If you want to use this feature, you will need to store the credentials in Vault and provide the necessary Vault information in the `config.ini` file.

## Running in AWS Lambda

This script can be adapted to run in an AWS Lambda function. It will require modification to handle the event input and to configure the AWS SDK.

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
