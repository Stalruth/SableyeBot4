Accurate as of 00:00 31-Jan-2021 UTC

# Sableye Bot 3 Privacy Policy

This Privacy Policy is written to expand on the data collected by Sableye Bot
versions 3.x.x (the "Application"), which of this data is processed or retained
and the basis for such processing or retention.

If such collection, processing, or retention is not desired then do not allow
the Application into your Server, restrict it's channel read permissions or
block its associated user.

## Methods of Data Collection

The Application collects data sent to it through the "gatewaty" offered by
Discord to allow people ("Users") to utilise the Application's features.

All data collection occurs through this facility, and the Application does not
engage in any passive collection of information outside of this channel.

Specifically, the Application subscribes to the `GUILD_MESSAGES` and
`DIRECT_MESSAGES` intents, allowing it to read all Messages in all Channels it
can view, and receive Direct Messages from Users.

*less formal aside: yes this sounds spooky but that's how bots find the messages
they're supposed to respond to.  Sableye Bot v4 addresses these issues and v3
will be phased out as Sableye Bot v4 is rolled out across Discord and changes
on Discord's side render it unable to read these messages.*

## What the Application Receives from Discord

The application receives the following information from Discord concerning each
Guild ("Server") the Application is in when it starts or when it is invited to a
new Guild:

  - ID

    Uniquely identifies the Guild

  - Name

  - Icon

  - Splash Image

  - Server Discovery Splash Image

  - Owner ID

    The User ID of the Guild's owner

  - AFK Voice Channel ID

  - AFK Timeout

  - Verification Level

  - Message Notifications Level

  - Explicit Content Filter Level

  - "Features" enabled on the server, such as Discord Experiments

  - Multi Factor Authentication requirement for moderation actions

  - Application ID for bot-created Guilds

  - ID of the channel where system messages are sent

  - The system messages that appear in the channel above

  - The Rules Channel of the Guild

  - The time the Application joined the Guild

  - Whether the Guild is considered "large"

  - The amount of Users of the Guild

  - Vanity URL Code

  - Community Description

  - Guild Banner

  - Server Boost Level

  - Current number of Boosts

  - Preferred Locale

  - ID of the channel where Moderators get updates from Discord

  - The Maximum amount of users in a Video Channel

  - NSFW level

  - The Welcome Screen Description and Channels

  - Whether the Server Boost Progress Bar is enabled

  - For each event

      - ID

        Uniquely identifies the Event

      - Start and End Times

      - Location

      - Privacy level

      - Name

      - Description

      - Image

  - For each Channel, Thread, and Category the Application can view

      - ID

        Uniquely identifies the Channel

      - Topic

      - Name

      - Position

      - Slow Mode settings

      - Permission overwrites

      - Bitrate and Region for Voice Channels

  - For Users currently in a Voice Chat

      - ID

        Uniquely identifies the User

      - Information on whether they are muted, deafened, or streaming video.

  - Roles

    Information about the Roles in the Guild, as listed below

      - ID

        Uniquely identifies the Role

      - Name

      - Colour

      - Whether the role is Hoisted

      - Icon

      - Emoji

      - Position

      - Permissions

      - Whether the Role is managed by an Integration (e.g. Bot roles)

      - Whether the Role can be @-mentioned

  - Emojis

      - ID

        Uniquely identifies the Emoji

      - Name

      - Roles allowed to use the emoji

      - Whether the emoji is animated

      - Whether the emoji is available for use

      - Whether the emoji is managed by an app

  - Stickers

      - ID

        Uniquely identifies the Sticker

      - Name

      - Description

      - Autocomplete tags

      - Whether the sticker is available for use

      - File format

This information is stored in a cache, and is deleted when the bot is restarted
for any reason.

- - -

The application receives the following information when it receives a Message.

  - ID

    Uniquely identifies the Message

  - Channel ID

  - Guild ID

  - The contents of the message, including embeds, attachments and components

  - The time the message was sent

  - Information about the sender and anyone @-mentioned in the message

      - ID

        Uniquely identifies the User

      - Username with Discriminator

      - Avatar

      - Badges that can be seen on the account

      - Nickname

      - Roles

      - Whether the user is Muted or Deafened in the server

This information is immediately discarded if the message content does not
contain a valid command.

## What the Application processes

The Application processes very limited information compared to what it is sent.

Guilds and Users are stored in a cache for use in the Application's other
functions.

Messages are discarded immediately if they do not contain a valid command.

If a message does contain a valid command processing will be done on the content
to parse the command's arguments and respond appropriately.

In the special case of `//fc`, if no argument is provided the Author's ID,
username and discriminator are processed, otherwise the ID of the user mentioned
is accessed.

## What the Application stores for an extended period

The Application stores some data for an extended period of time to assist in
development and debugging.  This data will be used to examine the popularity
of commands:

  - Command Name

    The name of the command invoked.

  - Guild ID, Name and Join Date

    Used to determine the direction of development with respect to the
    Migration to Slash Commands.

  - Messages that cause the Application to crash.

    This is used to fix critical vulnerabilities in the application code.
    
    Specifically, the guild, content and the author's username and discriminator
    are kept until the bug is fixed in order to facilitate debugging.

The Application also stores Friend Code Data added by the `//addfc` and
`//addgame` commands.  This can be removed at any time with the appropriate
`//removegame` and `//removefc` commands.

## Where this data is stored

The Application runs on infrastructure provided by Digital Ocean.

All information retained as per the above section is kept in an in-memory
database to facilitate queries on the data.

## Other personal Data

While other personal data is provided by Discord as outlined in the relevant
section above, it is generally only kept in cache and not written to disk or
used for any purpose outside of those outlined above.

