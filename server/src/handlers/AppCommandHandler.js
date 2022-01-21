'use strict';

const { InteractionResponseType } = require('discord-interactions');
const getargs = require('discord-getarg');
const fetch = require('node-fetch');

const { buildError } = require('embed-builder');

const definitions = [];
const commands = {};

const processes = {};
const autocompletes = {};
const modulePaths = {};
const defers = {};

function initCommand(name) {
  if(processes[name]) {
    // Command already added.
    return;
  }
  const {definition, command} = require(modulePaths[name]);
  definition['name'] = name;
  definitions.push(definition);
  commands[name] = command;
}

function addCommand(name, modulePath) {
  modulePaths[name] = modulePath;
}

addCommand('about', './ChatInputCommands/about.js');
addCommand('coverage', './ChatInputCommands/coverage.js');
addCommand('dt', './ChatInputCommands/dt.js');
addCommand('event', './ChatInputCommands/event.js');
addCommand('filter', './ChatInputCommands/filter.js');
addCommand('hiddenpower', './ChatInputCommands/hiddenpower.js');
addCommand('learn', './ChatInputCommands/learn.js');
addCommand('nature', './ChatInputCommands/nature.js');
addCommand('sprite', './ChatInputCommands/sprite.js');
addCommand('weakness', './ChatInputCommands/weakness.js');

addCommand('Search', './ContextMenuCommands/Search.js');

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
    initCommand(commandPath[0]);

    console.log(req.body.type, req.body.id, ...[0,1,2].map(e=>commandPath[e] ?? null), JSON.stringify(info.params));

    const commandData = getCommandData(commandPath);
    const process = (commandData.process ?? (()=>{}))(req.body);
    const defer = commandData.defer ?? false;

    if(defer) {
      res.json({
        type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
      });
      await fetch(`https://discord.com/api/v9/webhooks/${req.body.application_id}/${req.body.token}/messages/@original`,
      {
        method: 'PATCH',
        body: JSON.stringify(await process),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } else {
      return res.json(await process);
    }
  } catch (e) {
    console.error(e);
    throw(e)
  }
}

async function onAutocomplete(req, res) {
  const info = getargs(req.body);
  const commandPath = [req.body.data?.name, ...info.subcommand];

  try {
    initCommand(commandPath[0]);

    console.log(req.body.type, req.body.id, ...[0,1,2].map(e=>commandPath[e] ?? null), JSON.stringify(info.params), info.focused);

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

module.exports = { onApplicationCommand, onAutocomplete, getCommandDefinitions };

