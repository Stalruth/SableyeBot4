'use strict';

const getargs = require('discord-getarg');

const commands = [];
const processes = {};
const autocompletes = {};

const addCommand = async function(name, module) {
  const {command, process, autocomplete} = module;
  command['name'] = name;
  commands.push(command);
  processes[name] = process;
  if(autocomplete) {
    autocompletes[name] = autocomplete;
  }
};

addCommand('about', require('./ChatInputCommands/about.js'));
addCommand('ability', require('./ChatInputCommands/ability.js'));
addCommand('coverage', require('./ChatInputCommands/coverage.js'));
addCommand('dt', require('./ChatInputCommands/dt.js'));
addCommand('event', require('./ChatInputCommands/event.js'));
addCommand('filter', require('./ChatInputCommands/filter.js'));
addCommand('hiddenpower', require('./ChatInputCommands/hiddenpower.js'));
addCommand('item', require('./ChatInputCommands/item.js'));
addCommand('learn', require('./ChatInputCommands/learn.js'));
addCommand('move', require('./ChatInputCommands/move.js'));
addCommand('nature', require('./ChatInputCommands/nature.js'));
addCommand('pokemon', require('./ChatInputCommands/pokemon.js'));
addCommand('sprite', require('./ChatInputCommands/sprite.js'));
addCommand('weakness', require('./ChatInputCommands/weakness.js'));

async function onApplicationCommand(req, res) {
  const info = getargs(req.body);
  const command = [req.body.data?.name, ...info.subcommand];

  console.log(req.body.type, req.body.id, ...[0,1,2].map(e=>command[e] ?? null), info.params);
  try {
    if(command.length === 1) {
      res.json(await processes[command[0]](req.body));
    } else if(command.length === 2) {
      res.json(await processes[command[0]][command[1]](req.body));
    } else {
      res.json(await processes[command[0]][command[1]][command[2]](req.body));
    }
  } catch (e) {
    throw e;
  }
}

async function onAutocomplete(req, res) {
  const info = getargs(req.body);
  const command = [req.body.data?.name, ...info.subcommand];

  console.log(req.body.type, req.body.id, ...[0,1,2].map(e=>command[e] ?? null), info.params, info.focused);
  try {
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

function getCommands() {
  return commands;
}

module.exports = { onApplicationCommand, onAutocomplete, getCommands };

