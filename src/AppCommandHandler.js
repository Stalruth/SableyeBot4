'use strict';

const getargs = require('discord-getarg');

const definitions = [];
const processes = {};
const autocompletes = {};
const modulePaths = {};

function initCommand(name) {
  if(processes[name]) {
    // Command already added.
    return;
  }
  const {command, process, autocomplete} = require(modulePaths[name]);
  command['name'] = name;
  definitions.push(command);
  processes[name] = process;
  if(autocomplete) {
    autocompletes[name] = autocomplete;
  }
}

function addCommand(name, modulePath) {
  modulePaths[name] = modulePath;
}

addCommand('about', './ChatInputCommands/about.js');
addCommand('ability', './ChatInputCommands/ability.js');
addCommand('coverage', './ChatInputCommands/coverage.js');
addCommand('dt', './ChatInputCommands/dt.js');
addCommand('event', './ChatInputCommands/event.js');
addCommand('filter', './ChatInputCommands/filter.js');
addCommand('hiddenpower', './ChatInputCommands/hiddenpower.js');
addCommand('item', './ChatInputCommands/item.js');
addCommand('learn', './ChatInputCommands/learn.js');
addCommand('move', './ChatInputCommands/move.js');
addCommand('nature', './ChatInputCommands/nature.js');
addCommand('pokemon', './ChatInputCommands/pokemon.js');
addCommand('sprite', './ChatInputCommands/sprite.js');
addCommand('weakness', './ChatInputCommands/weakness.js');

async function onApplicationCommand(req, res) {
  const info = getargs(req.body);
  const command = [req.body.data?.name, ...info.subcommand];

  try {
    initCommand(command[0]);

    console.log(req.body.type, req.body.id, ...[0,1,2].map(e=>command[e] ?? null), JSON.stringify(info.params));

    if(command.length === 1) {
      res.json(await processes[command[0]](req.body));
    } else if(command.length === 2) {
      res.json(await processes[command[0]][command[1]](req.body));
    } else {
      res.json(await processes[command[0]][command[1]][command[2]](req.body));
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

    if(command.length === 1) {
      res.json(await autocompletes[command[0]](req.body));
    } else if(command.length === 2) {
      res.json(await autocompletes[command[0]][command[1]](req.body));
    } else {
      res.json(await autocompletes[command[0]][command[1]][command[2]](req.body));
    }
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
  const commands = Object.keys(moduleLocations);
  for(i of commands) {
    initCommand(i);
  }
  return definitions;
}

module.exports = { onApplicationCommand, onAutocomplete, getCommandDefinitions };

