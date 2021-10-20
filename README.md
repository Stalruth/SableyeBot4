# SableyeBot 4

Competitive Pokémon Discord Bot, rewritten from the ground up.

This software is in beta and may have some issues.

Proceed with caution.

## Installation
`discord.js@13.0.0` (and therefore SableyeBot 4) requires NodeJS v16.6.

Follow these steps to run your own local copy:

1. Clone this repository.
2. Rename `example.env` to `.env` and fill out the fields needed.
3. Run `npm i` to install dependencies.
4. Set environment variables, check `example.env` for guidance.
5. Run `npm run update-commands` to update command definitions with Discord.
6. Run `npm run start` and you're off to the races!
7. You should also use `ngrok` or simlar to get this working in a test
   environment that isn't directly exposed to the internet.

And not nearly as soul crushing as SabelyeBot 3!

## Some further detail

Of the dependencies only `express` and `tweetnacl` are actually used
for the bot's backbone.  All the other packages are used in command
handling.

`dotenv` is used to make testing easier and `node-fetch` is used in the
`update-commands` script.

## Issues

Beta software has bugs.  Fact of life.  If you find a bug, please
include the following in your [complaint][hatemail]:

- A description of the bug (What should have happened! What did happen!)
- Reproduction steps (This usually means paste out the commands you
  used, including arguments)
- Screenshots/Pastes of output, GIFs if necessary.
- Bot version (`/about` has this info)
- Any other additional information you think might be useful.

## Contributing

If you can help me out I'm always open to pull requests.  Don't worry
about styling - as long as your code is prettier than a dumpster fire
I'll fuss over the specifics myself.

## Credits
* [unlucky4ever's RuneCord][1] (by @unlucky4ever), which SableyeBot4
  traces its lineage to.
* [PokemonShowdown][2] (by @Zarel/@smogon), the initial source of our
  data.
* [Modular Pokémon Showdown][3] (by @pkmn), which puts PS into an
  easily dependable format.
* [SableyeBot3][4] (by @JsKingBoo), the direct predecessor to this bot.

## Licensing

MIT License.

[hatemail]: https://github.com/Stalruth/SableyeBot4/issues/new
[1]: https://github.com/unlucky4ever/RuneCord
[2]: https://github.com/Zarel/Pokemon-Showdown
[3]: https://github.com/pkmn/ps
[4]: https://github.com/JsKingBoo/SableyeBot3

