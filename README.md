# SableyeBot 4

[Invite this bot to your guild!][invite]

Competitive Pokémon Discord Bot, rewritten from the ground up.

## Installation

SableyeBot v4 requires NodeJS v16.

Follow these steps to run your own local copy:

1. Clone this repository.
2. Rename `example.env` to `.env` and fill out the fields needed.
3. Run `npm i` to install dependencies.
4. Enter the `server` directory and run `npm i` to install its dependencies.
5. Run `npm run update-commands` to update command definitions with Discord.
6. Run `npm run debug` to run the application proper.
    - You should use `ngrok` or simlar to get this working in a test
      environment that isn't directly exposed to the internet.
7. For production use, run `server/src/index.js` on a server.

## Issues

If you find a bug, please include the following in your [complaint][hatemail]:

- A description of the bug (What should have happened? What did happen?)
- Reproduction steps (This usually means pasting out the commands you used,
  including arguments)
- Screenshots/Pastes of output, GIFs if necessary.
- Bot version if you're running your own instance
    - `/about` has this info
    - Not needed if you're using the Verified bot `@Sableye Bot#0303`
- Any other additional information you think might be useful.

## Contributing

If you can help me out I'm always open to pull requests.  Don't worry
about styling - as long as your code is prettier than a dumpster fire
I'll fuss over the specifics myself.

## Credits
* [PokemonShowdown][1] (by @Zarel/@smogon), the initial source of our
  data.
* [Modular Pokémon Showdown][2] (by @scheibo/@pkmn), which puts PS into an
  easily queried format.
* [SableyeBot3][3] (by @JsKingBoo), the direct predecessor to this bot.

## Licensing

[MIT License][LICENSE]

[hatemail]: https://github.com/Stalruth/SableyeBot4/issues/new
[invite]: https://discord.com/api/oauth2/authorize?client_id=211522070620667905&permissions=0&scope=applications.commands%20bot
[LICENSE]: /LICENSE
[1]: https://github.com/Zarel/Pokemon-Showdown
[2]: https://github.com/pkmn/ps
[3]: https://github.com/JsKingBoo/SableyeBot3

