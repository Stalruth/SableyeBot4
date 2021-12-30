Accurate as of 22:00 30-Dec-2021 Australian Eastern Daylight Time (UTC+11)

# Sableye Bot Privacy Policy

This Privacy Policy is written to expand on the data collected by SableyeBot
versions 4 and above (the "Application"), which of this data is processed or
retained and the basis for such processing or collection.

If such collection or processing is not desired then do not engage with the
Application in the ways detailed below.

## Methods of Data Collection

The Application collects data sent to it through the "Interactions" facilities
offered by Discord by people who use the commands provided by the Application
("Users").

All data collection occurs through this facility, and the Application does not
engage in any passive collection of information outside of this channel.

## What the Application Collects

The application receives the following information from Discord when an
Interaction is received:

  - Guild ID

    Uniquely identifies the "Server" the Interaction was sent in

  - Channel ID

    Uniquely identifies the "Channel" the Interaction was sent in

  - Command Name

    The name of the command invoked.

  - Command Parameters

    Parameters passed to the command, their values, and any Subcommand invoked.

  - Data pertaining to the User:

      - User ID

        Uniquely identifies the User's Discord account

      - Username and Discriminator

        The name selected by the user and the number attached, able to
        uniquely identify a user at the time of collection.

      - Avatar Hash

        Hash of the user's avatar, can be used with the User ID to get the
        User's Avatar at the time of collection.

      - Public Flags

        Any Public Flags applied to the account, such as Dsicord HypeSquad
        status.

      - Guild Nickname

        The User's Nickname in the Guild the command is used in.

      - Role IDs

      - Time and Date the User joined the Guild the command was used in

      - Time the user last started Boosting the Guild

      - Whether the user is deafened or muted in the Guild's Voice Channels.

      - Whether the user has passed Membership Screening

      - The permissions the user has in the server.

## What the Application processes

The Application processes some of the information listed above to fulfil the
requests made of it, as follows:

  - Command Name

    The name of the command invoked.

  - Command Parameters

    Parameters passed to the command, their values, and any Subcommand invoked.

## What the Application stores for an extended period

The Application stores some data for an extended period of time to assist in
development and debugging.  This data will be used to examine the popularity
of commands and the popularity of different paramters:

  - Command Name

    The name of the command invoked.

  - Command Parameters

    Parameters passed to the command, their values, and any Subcommand invoked.

## Where this data is stored

The Application runs on Firebase Cloud Functions, and all information logged is
stored in these execution logs.

The `/filter` command also stores the following in Firebase Realtime Database
for up to 15 minutes to facilitate advanced queries:

  - The time the command was used

  - The results of the command

  - The parameters passed to the command

## Personal Information

No personal information is processed or retained for any length of time.  While
this data is received from Discord, it is not used in the provision of the
Application's functionality.

