# Slash Command Migration

## The Current State of Things

Sableye Bot currently accepts two different kinds of commands:

- Message commands: These are the old commands we all know and love, which
    would be sent as a message and the bot would respond to that message.

    Exacmples include `//dt Sableye` and `//sprite Yveltal`.

- Slash Commands: These are the new commands that pop up when you type a `/`
    in the message box, that provide a UI that shows you the parameters for
    each command and some options for their values.

## What's Changing?

On the 31st of March 2022, Sableye Bot will no longer be able to respond to
Message Commands - from this date onwards Sableye Bot will only respond to
Slash Commands.

This means that the usage of the bot changes dramatically, however the new
commands come with built-in help text to describe the function of each command.

Additionally, some commands are being removed without replacement. These are:

- `//addfc`
- `//addgame`
- `//deletefc`
- `//deletegame`
- `//fc`

    These commands have fallen out of use in recent years with the release of
    the Switch games, and I would like to get my GDPR obligations out of the way
    permanently.

- `//ability`
- `//item`
- `//move`
- `//pokedex`
- `//nature`

    These were already called by `//data` (better knows as `//dt`), but the
    new `/dt` command also has a prompt to properly disambiguate between
    Metronome the Item and Metronome the Move.

    Additionally, these commands weren't used much compared to the
    (equivalent) `//data` command.

- The following filters on `//filter`:
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

      These are all either not relevant to competitive Pokémon or return very,
      *very* few results to the point where filtering for them is not useful.

    - `gen`

      This filter seemed to get no use outside of people who meant to use the
      `--gen` flag to look up another game's data.

    - `monotype`

      This filter can be replicated with `types` as you can negate items with
      an exclamation mark prefix.

## Why?

On the 30th of July 2021, Discord announced that access to Message Contents
(required for Message Commands) would be placed behind a Privileged Intent,
and only bots with features that depended on access to Message Content in a
way that cannot be replicated with Slash Commands would be allowed to have
it.

This is a greatly positive step in terms of user privacy (did you ever think
about how Sableye Bot's been reading every message it's seen for the past
five years?) but it does require a retooling of Sableye Bot's source code to
accept the new commands.

The first version of Sableye Bot 4 was completed after about a week's worth
of work, on the 5th of August.  It wasn't complete - notably it was missing
replacements for `//filter` and `//sprite` - but over the next five months
it became a nearly feature complete replacement for the previous version of
Sableye Bot.

It's my hope that many of the new commands are easier for people to use,
especially with the addition of Autocomplete options, though there are also
definitely some commands which suffer such as `/filter`.

## Why disable the commands a month early?

I want to make the cut early so that the new bot can be tested under production
conditions while I still have the option of going back if needed.

## Workarounds

Speaking of those other commands, some command parameters mention in their
descriptions that they are "Comma delimited lists".  This means that if you
wish to pass multiple values to them you can - just separate different values
with commas.

For example, where the old command would take `//coverage Dark, Fire` the new
command works with `/coverage types:Dark, Fire`.

This isn't perfect and I'll definitely be keeping my eyes open for any
improvements I can make to these commands, but this is the workaround for now.

[hatemail]: https://github.com/Stalruth/SableyeBot4/issues/new

