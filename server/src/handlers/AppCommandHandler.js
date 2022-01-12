'use strict';

const { InteractionResponseType } = require('discord-interactions');
const getargs = require('discord-getarg');
const fetch = require('node-fetch');

const definitions = [];
const processes = {};
const autocompletes = {};
const modulePaths = {};
const defers = {};

function initCommand(name) {
  if(processes[name]) {
    // Command already added.
    return;
  }
  const {command, process, defer, autocomplete} = require(modulePaths[name]);
  command['name'] = name;
  definitions.push(command);
  processes[name] = process;
  defers[name] = defer;
  if(autocomplete) {
    autocompletes[name] = autocomplete;
  }
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

async function onApplicationCommand(req, res) {
  const info = getargs(req.body);
  const command = [req.body.data?.name, ...info.subcommand];

  try {
    initCommand(command[0]);

    console.log(req.body.type, req.body.id, ...[0,1,2].map(e=>command[e] ?? null), JSON.stringify(info.params));

    let commandProcess = (async()=>({}))();
    let defer = false;
    if(command.length === 1) {
      commandProcess = processes[command[0]](req.body);
      defer = defers[command[0]];
    } else if(command.length === 2) {
      commandProcess = processes[command[0]][command[1]](req.body);
      defer = defers[command[0]]?.[command[1]];
    } else {
      commandProcess = processes[command[0]][command[1]][command[2]](req.body);
      defer = defers[command[0]]?.[command[1]]?.[command[2]];
    }

    if(defer) {
      res.json({
        type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
      });
      await fetch(`https://discord.com/api/v9/webhooks/${req.body.application_id}/${req.body.token}/messages/@original`,
      {
        method: 'PATCH',
        body: JSON.stringify(await commandProcess),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } else {
      res.json(await commandProcess);
    }
  } catch (e) {
    console.error(e);
    throw(e)
  }
}

async function onAutocomplete(req, res) {
  const info = getargs(req.body);
  const command = [req.body.data?.name, ...info.subcommand];

  try {
    initCommand(command[0]);

    console.log(req.body.type, req.body.id, ...[0,1,2].map(e=>command[e] ?? null), JSON.stringify(info.params), info.focused);

    let autocompleteProcess = () => ({type:8,choices:[info.params[info.focused]]});
    if(command.length === 1) {
      autocompleteProcess = autocompletes[command[0]];
    } else if(command.length === 2) {
      autocompleteProcess = autocompletes[command[0]][command[1]];
    } else {
      autocompleteProcess = autocompletes[command[0]][command[1]][command[2]];
    }
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

