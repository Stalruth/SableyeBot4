import { InteractionResponseType } from 'discord-interactions';

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

