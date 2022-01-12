# Slash Command Migration

## The Current State of Things

Sableye Bot currently accepts two different kinds of commands:

- Prefix commands: These are the old commands we all know and love, which
    would be sent as a message and the bot would respond to that message.

    Exacmples include `//dt Sableye` and `//sprite Yveltal`.

- Slash Commands: These are the new commands that pop up when you type a `/`
    in the message box, that provide a UI that shows you the parameters for
    each command and some options for their values.

## What's Changing?

On the 30th of March 2022, Sableye Bot will no longer be able to respond to
Prefix Commands - from this date onwards Sableye Bot will only respond to
Slash Commands.

This means that the usage of the bot changes dramatically.

Additionally, some commands are being removed without replacement. These are:

- `//calculator`

    This was only a link to the Pokemon Showdown Damage Calculator.  I
    strongly suspect it will not be missed.

- `//addfc`
- `//addgame`
- `//deletefc`
- `//deletegame`
- `//fc`

    These commands are a legal nightmare to behold.  They were useful to a
    lot of people while they were there but I will not be missing them.

    That said if you want these to be ported over please [let me know!][hatemail]

- `//ability`
- `//item`
- `//move`
- `//pokedex`
- `//nature`

    These were already called by `//data` (better knows as `//dt`), but the
    new `/dt` command also has a prompt to properly disambiguate between
    Metronome the Item and Metronome the move.

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
      an exclamation mark prefix - but this is also not incredibly useful.

## Why?

On the 30th of July 2021, Discord announced that access to Message Contents
(required for Prefix Commands) would be placed behind a Privileged Intent,
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
it would become a nearly feature complete replacement for the previous
version of Sableye Bot.

Yes bots are able to access the contents of messages featuring their @mention
or in their Direct Messages - this was only negotiated by the Bot Developer
community after I'd finished the initial version.

It's my hope that many of the new commands are easier for people to use,
especially with the addition of Autocomplete options, though there are also
definitely some commands which suffer such as `/filter`.

## Why disable the commands a month early?

So that if everything goes horribly wrong I can reinstate the old bot while
things get fixed.

## Workarounds

Speaking of those other commands, some command parameters mention in their
descriptions that they are "Comma delimited lists".  This means that if you
wish to pass multiple values to them you can - just separate different values
with commas.

For example, where the old command would take `//coverage dark fire` the new
command works with `/coverage types:Dark, Fire`.

This isn't perfect and I'll definitely be keeping my eyes open for any
improvements I can make to these commands, but this is the workaround for now.

[hatemail]: https://github.com/Stalruth/SableyeBot4/issues/new
