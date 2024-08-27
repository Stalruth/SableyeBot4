import { ButtonStyleTypes, InteractionResponseType, MessageComponentTypes } from 'discord-interactions';

import { buildEmbed } from '#utils/embed-builder';

import getargs from '#utils/discord-getarg';

const definitions = [];
const commands = {};
const modulePaths = {};

function initCommand(name) {
}

function addCommand(name, module) {
  if(commands[name]) {
    // Command already added.
    return;
  }
  const {definition, command} = module.default;
  definition['name'] = name;
  definitions.push(definition);
  commands[name] = command;
}

function getCommandData(commandPath) {
  if(commandPath.length === 1) {
    return commands[commandPath[0]];
  } else if(commandPath.length === 2) {
    return commands[commandPath[0]][commandPath[1]];
  } else {
    return commands[commandPath[0]][commandPath[1]][commandPath[2]];
  }
}

async function onApplicationCommand(req, res) {
  const info = getargs(req.body);
  const commandPath = [req.body.data?.name, ...info.subcommand];

  let isFirstResponse = true;
  const respond = async (response) => {
    if(response.type == InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE) {
      if(!response.data.embeds) {
        response.data.embeds = [];
      }
      response.data.embeds.push(buildEmbed({
        title: 'Sableye Bot Deprecation',
        description: 'Due to changes in how Discord handles Verification, Sableye Bot will no longer operate at some point in the coming weeks. To continue using Sableye Bot, Please add "Sableye" to your server using the button below. Sableye will also be receiving fixes and new features that this version of Sableye Bot will not.\n\nFor more information please either get in touch via the Support Server linked below or read more in [this GitHub issue](https://github.com/Stalruth/SableyeBot4/issues/3#issuecomment-2311363974).',
        color: 0xa80000
      }));

      response.data.components = [{
        type: MessageComponentTypes.ACTION_ROW,
        components: [
          {
            type: MessageComponentTypes.BUTTON,
            style: ButtonStyleTypes.LINK,
            label: 'Add the New App to Server/User',
            url: 'https://discord.com/oauth2/authorize?client_id=1254384836685336616',
          },
          {
            type: MessageComponentTypes.BUTTON,
            style: ButtonStyleTypes.LINK,
            label: 'Support Server',
            url: 'https://discord.gg/etUxhVfA7u',
          },
          {
            type: MessageComponentTypes.BUTTON,
            style: ButtonStyleTypes.LINK,
            label: 'Terms of Use',
            url: 'https://sableye-bot.xyz/TERMS',
          },
          {
            type: MessageComponentTypes.BUTTON,
            style: ButtonStyleTypes.LINK,
            label: 'Privacy Policy',
            url: 'https://sableye-bot.xyz/PRIVACY',
          },
        ]
      }]
    }

    if(isFirstResponse) {
      isFirstResponse = false;
      res.json(response)
    } else {
      const url = `https://discord.com/api/v10/webhooks/${req.body.application_id}/${req.body.token}/messages/@original`;
      const options = {
        method: 'PATCH',
        body: JSON.stringify(response),
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': `DiscordBot (https://github.com/Stalruth/SableyeBot4, v${process.env.npm_package_version})`,
        },
      };

      let serverResponse = await fetch(url, options);

      if(!serverResponse.ok) {
        if(serverResponse.status === 404) {
          await new Promise(() => setTimeout(()=>{}, 200));
          serverResponse = await fetch(url, options);
        }
        else {
          throw new Error(`${serverResponse.status} ${await serverResponse.text()}`);
        }
      }
    }
  }

  try {
    console.log(JSON.stringify({
      interactionType: req.body.type,
      guildId: req.body.guild_id,
      id: req.body.id,
      command: `${[0,1,2].map(e=>commandPath[e] ?? null).join(' ').trim()}`,
      params: info.params
    }));

    const commandData = getCommandData(commandPath);
    const process = (commandData.process ?? (()=>{}))(req.body, respond);
    const followUp = commandData.followUp ?? (()=>{});

    await process;
  } catch (e) {
    console.error(JSON.stringify({
      interactionType: req.body.type,
      guildId: req.body.guild_id,
      id: req.body.id,
      command: `'${[0,1,2].map(e=>commandPath[e] ?? null).join(' ').trim()}'`,
      params: info.params
    }));
    console.error(e);
    throw(e);
  }
}

async function onAutocomplete(req, res) {
  const info = getargs(req.body);
  const commandPath = [req.body.data?.name, ...info.subcommand];

  try {
    console.log(JSON.stringify({
      interactionType: req.body.type,
      guildId: req.body.guild_id,
      id: req.body.id,
      command: `${[0,1,2].map(e=>commandPath[e] ?? null).join(' ').trim()}`,
      params: info.params
    }));
    initCommand(commandPath[0]);

    const commandData = getCommandData(commandPath);
    const autocompleteProcess = commandData.autocomplete[info.focused] ?? (()=>({type:8,choices:[info.params[info.focused]]}));

    res.json(await autocompleteProcess(req.body));
  } catch(e) {
    res.json({
      type: 8,
      data: {
        choices: [
          {
            name: info.params[info.focused],
            value: info.params[info.focused],
          },
        ],
      },
    });
    throw e;
  }
}

function getCommandDefinitions() {
  const commands = Object.keys(modulePaths);
  for(const i of commands) {
    initCommand(i);
  }
  return definitions;
}

export { addCommand, onApplicationCommand, onAutocomplete, getCommandDefinitions };

