# Slash Command Migration

On the 14th of August 2022, Sableye Bot's Message Content Commands were retired.
The bot will be using Slash Commands exclusively from this point onwards.

From the 14th of August until the 1st of September, Sableye Bot will respond to
Message Content Commands with a notice saying that Message Content Commands are
no longer supported and the equivalent Slash Command.

The help text built in to each Slash Command describes each command and
option in detail.

While most commands have been migrated, some are being dropped:

- `//addfc`
- `//addgame`
- `//deletefc`
- `//deletegame`
- `//fc`

    These commands are less useful in the context of the Nintendo Switch, and
    no longer justify the legal obligations created by collecting user data.

- `//ability`
- `//item`
- `//move`
- `//pokedex`
- `//nature`

    These commands were never used as much as the `//data` command.

    Additionally, between the above commands causing confusion for users when
    displayed as Slash Commands and improved disambiguation in `/data` removing
    these commands reduces redundancy and makes the bot easier to use.

Additionally, the following arguments on `//filter` have been dropped:

- `num`
- `species`
- `baseSpecies`
- `prevo`
- `evos`
- `evoLevel`
- `color`
- `forme`
- `formeLetter`
- `otherFormes`
- `otherForms`

    These are either irrelevant to Competitive Pokémon or return so few results
    they are almost useless.

- `gen`

    Not only is this filter genereally irrelevant to Competeitive Pokémon, it
    was also confused for the `--gen` flag that would change the games searched.

- `monotype`

    This filter can be replicated with `types` as you can negate items with
    an exclamation mark prefix.

## Why is this happening?

In an effort to increase user privacy, Discord is placing access to Message
Contents behind scrutiny where a bot would need to demonstrate a valid reason
to have it.

All bots without such allowances made will stop being able to read user
messages, including any commands within them, from the 1st of September 2022.

## Workarounds

Slash Commmands are still not total replacements for Message Content commands.

To compensate, some options that used to be repeatable can now take multiple
values eparated by commas. These options are described as such in their
descriptions.

For example, where the old command would take `//coverage Dark, Fire`
the new command works with `/coverage types:Dark, Fire`.

Hopefully Discord can make improvements in this area soon, though I'm personally
not holding my breath.

