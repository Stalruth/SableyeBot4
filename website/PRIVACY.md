Accurate as of 00:00 15-Mar-2021 UTC

# Sableye Bot Privacy Policy

This Privacy Policy is written to detail the data collected by Sableye Bot
versions 4 and above (the "Application"), which of this data is processed or
retained and the basis for such processing or retention.

If such collection, processing, or retention is not desired then do not engage
with the Application in the ways detailed below.

## Methods of Data Collection

The Application collects data sent to it through the "Interactions" facilities
offered by Discord to allow people ("Users") to utilise the Application's
features.

## What the Application Receives from Discord

The application receives the following information from Discord when an
Interaction is received:

  - Guild ID

    Uniquely identifies the "Server" the Interaction was sent in.

  - Guild Locale

    Language set for the "Server".

  - Channel ID

    Uniquely identifies the "Channel" the Interaction was sent in.

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

        Any Public Flags applied to the account, such as Discord HypeSquad
        status.

      - Guild Nickname

        The User's Nickname in the Guild the command is used in.

      - Role IDs

      - Time and Date the User joined the Guild the command was used in

      - Time the user last started Boosting the Guild

      - Whether the user is deafened or muted in the Guild's Voice Channels.

      - Whether the user has passed Membership Screening

      - The permissions the user has in the server.

      - The User Locale

        The Language the user has set in their Discord Client

## What the Application processes

The Application processes some of the information listed above to fulfil the
requests made of it, as follows:

  - Command Name

    The name of the command invoked.

  - Command Parameters

    Parameters passed to the command, their values, and any Subcommand invoked.

  - Username and User ID

    Some commands `/linkcode` and `Get Linking Code` process the Discord
    Username and User ID in creating their results.

## What the Application stores for an extended period

The Application stores all collected data for an extended period of
time to assist in development and debugging.  This data is shared with Sentry
(https://sentry.io) to help provide analysis on error rates and performance.

This data is deleted after 30 days.

The data listed below is also shared with Logtail (https://logtail.com) for
the purposes of analysing command popularity and usage.

This data is deleted after 3 days.

  - Guild ID

    The ID of the Guild the command is run in.

  - Command Name

    The name of the command invoked.

  - Command Parameters

    Parameters passed to the command, their values, and any Subcommand invoked.

## Where this data is stored

The Application runs on infrastructure provided by Digital Ocean.

The `/filter` command also stores the following information in an in-memory
database for up to 15 minutes to facilitate pagination of query results:

  - The time the command was used

  - The results of the command

## Personal Information

No personal information is processed or retained for any length of time.  While
some Personal Information is received from Discord, it is not used in the
provision of the Application's functionality.

