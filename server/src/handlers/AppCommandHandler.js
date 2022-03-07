'use strict';

const { InteractionResponseType } = require('discord-interactions');
const getargs = require('discord-getarg');

const { buildError } = require('embed-builder');

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
  const {definition, command} = module;
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

  try {
    console.log(req.body.type, req.body.guild_id, req.body.id, ...[0,1,2].map(e=>commandPath[e] ?? null), JSON.stringify(info.params));

    const commandData = getCommandData(commandPath);
    const process = (commandData.process ?? (()=>{}))(req.body);
    const followUp = commandData.followUp ?? (()=>{});

    res.json(await process);

    await followUp(req.body);
  } catch (e) {
    console.error(req.body.type, req.body.guild_id, req.body.id, ...[0,1,2].map(e=>commandPath[e] ?? null), JSON.stringify(info.params));
    throw(e)
  }
}

async function onAutocomplete(req, res) {
  const info = getargs(req.body);
  const commandPath = [req.body.data?.name, ...info.subcommand];

  try {
    initCommand(commandPath[0]);

    const commandData = getCommandData(commandPath);
    const autocompleteProcess = commandData.autocomplete ?? (()=>({type:8,choices:[info.params[info.focused]]}));

    res.json(await autocompleteProcess(req.body));
  } catch(e) {
    res.json({
      type: 8,
      data: {
        choices: [
          info.params[info.focused],
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

module.exports = { addCommand, onApplicationCommand, onAutocomplete, getCommandDefinitions };

