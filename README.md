# SableyeBot 4

Competitive Pokémon Discord Bot, rewritten from the ground up.

This software is in omega, which like an omega means it exists to serve the
alpha.  If it does not do this, [let me know][hatemail].

Proceed with caution.

## Installation
SableyeBot v4 requires NodeJS v16.

Follow these steps to run your own local copy:

1. Clone this repository.
2. Rename `example.env` to `.env` and fill out the fields needed.
3. Set up a local Google Cloud environment.
4. Run `npm i` to install dependencies.
5. Set environment variables, check `example.env` for guidance.
6. Run `npm run update-commands` to update command definitions with Discord.
7. TODO: local testing
    - You should use `ngrok` or simlar to get this working in a test
      environment that isn't directly exposed to the internet.
8. Run gcloud deploy with the appropriate parameters:

    `gcloud functions deploy sableye --runtime nodejs16 --trigger-http --allow-unauthenticated --set-env-vars PUBLIC_KEY=[YOUR_KEY]`

    TODO: surely it doesn't need to be *that* long!

And not nearly as soul crushing as SabelyeBot 3!

## Some further detail

Of the dependencies only `discord-interactions-js` is actually used for the
bot's backbone.  All the other packages are used in providing specific
commands.

`dotenv` and `node-fetch` are used in the `update-commands` script.

## Issues

Beta software has bugs.  Fact of life.  If you find a bug, please
include the following in your [complaint][hatemail]:

- A description of the bug (What should have happened? What did happen?)
- Reproduction steps (This usually means pasting out the commands you used,
  including arguments)
- Screenshots/Pastes of output, GIFs if necessary.
- Bot version (`/about` has this info)
- Any other additional information you think might be useful.

## Contributing

If you can help me out I'm always open to pull requests.  Don't worry
about styling - as long as your code is prettier than a dumpster fire
I'll fuss over the specifics myself.

## Credits
* [PokemonShowdown][1] (by @Zarel/@smogon), the initial source of our
  data.
* [Modular Pokémon Showdown][2] (by @pkmn), which puts PS into an
  easily queried format.
* [SableyeBot3][3] (by @JsKingBoo), the direct predecessor to this bot.

## Licensing

[MIT License][LICENSE]

[hatemail]: https://github.com/Stalruth/SableyeBot4/issues/new
[LICENSE]: /LICENSE
[1]: https://github.com/Zarel/Pokemon-Showdown
[2]: https://github.com/pkmn/ps
[3]: https://github.com/JsKingBoo/SableyeBot3

