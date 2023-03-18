# Twitch-and-toot

Twitch-and-toot is an open source project that allows you to post to Mastodon when a streamer is live on Twitch. It is built on NodeJS and can run on a RaspberryPi, Single Board Computer, Linux VPS, or a private server.
Requirements and Prerequisites

    NodeJS installed on the device that you plan to run the script on.
    A Twitch API key (client ID and secret) which can be obtained from the Twitch Developer Dashboard.
    A Mastodon API key (access token) which can be obtained from your Mastodon instance.

## Installation

    Clone the Github repository to your device: git clone https://github.com/ChiefGyk3D/twitch-and-toot.git
    Install the required packages: npm install
    Create a config.json file based on the config_template.json file in the repository. Fill in the required information such as Twitch API key, Mastodon API key, and the channel name you want to track, messages, and any other changes needed.
    Run the script: node twitch-and-toot.js

## Configuration

The configuration file config.json is used to store the required information such as Twitch API key, Mastodon API key, and the channel name you want to track.

You can also customize the messages that will be posted to Mastodon when the streamer is live as well as when the stream has ended. You can set any random messages and number of them in config.json. The latest version allows you to include the stream title and URL in the messages by using {streamTitle} and {streamURL} placeholders, which will be replaced with the actual stream title and URL, respectively.

For example, you can set a message like this in config.json:

`"Go check out \"{streamTitle}\" at {streamURL}!"`

You can customize the number of hours between Mastodon posts allowed per stream, by default it is set to every 6 hours. But feel free to adjust this to any whole number you prefer.
You can customize the number of minutes after a stream has ended to make an end of stream post, as well as if you want end of stream messages enabled at all.

## Modules

The auth.js, channelData.js, and getStreams.js modules are borrowed from Twitch-Discord-Bot (https://github.com/Siddhart/Twitch-Discord-Bot). They are used to obtain the required information from the Twitch API and post to Mastodon.

## plans
    
    Create a SystemD service to keep the script running and boot with the device hosting it.
    Dockerize this all as well
    Add ability to optionally use Twitter as well

## Donations and Tips

If you would like to support the development of Twitch-and-toot, you can donate through the following links: https://links.chiefgyk3d.com

You can also tip the author with the following cryptocurrency addresses:

    Bitcoin: bc1q5grpa7ramcct4kjmwexfrh74dvjuw9wczn4w2f
    Monero: 85YxVz8Xd7sW1xSiyzUC5PNqSjYLYk4W8FMERVkvznR38jGTBEViWQSLCnzRYZjmxgUkUKGhxTt2JSFNpJuAqghQLhHgPS5
    PIVX: DS1CuBQkiidwwPhkfVfQAGUw4RTWPnBXVM
    Ethereum: 0x2a460d48ab404f191b14e9e0df05ee829cbf3733

Author

ChiefGyk3D is the author of Twitch-and-toot, with assistance from Y-Love to educate on NodeJS. ChatGPT helped build about 80% of the template
[ChiefGyk3D's Mastodon Account](https://social.chiefgyk3d.com/@chiefgyk3d)
