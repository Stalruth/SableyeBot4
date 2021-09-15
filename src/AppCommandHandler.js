'use strict';

const { getargs } = require('discord-getarg');

const commands = [];
const processes = {};

const addCommand = async function(name, module) {
  const {command, process} = module;
  command['name'] = name;
  commands.push(command);
  processes[name] = process;
};

addCommand('nature', require('./ChatInputCommands/nature.js'));
addCommand('calculator', require('./ChatInputCommands/calculator.js'));
addCommand('hiddenpower', require('./ChatInputCommands/hiddenpower.js'));
addCommand('about', require('./ChatInputCommands/about.js'));
addCommand('ability', require('./ChatInputCommands/ability.js'));
addCommand('move', require('./ChatInputCommands/move.js'));
addCommand('item', require('./ChatInputCommands/item.js'));
addCommand('pokemon', require('./ChatInputCommands/pokemon.js'));
addCommand('dt', require('./ChatInputCommands/dt.js'));
addCommand('event', require('./ChatInputCommands/event.js'));
addCommand('sprite', require('./ChatInputCommands/sprite.js'));
addCommand('coverage', require('./ChatInputCommands/coverage.js'));
addCommand('learn', require('./ChatInputCommands/learn.js'));
addCommand('weakness', require('./ChatInputCommands/weakness.js'));
addCommand('filter', require('./ChatInputCommands/filter.js'));

const onApplicationCommand = (req, res) => {
  const info = getargs(req.body);
  const command = [req.body.data?.name, ...info.subcommand];

  console.log(req.body.id, ...[0,1,2].map(e=>command[e] ?? null), info.params);
  try {
    if(command.length === 1) {
      processes[command[0]](req, res);
    } else if(command.length === 2) {
      processes[command[0]][command[1]](req, res);
    } else {
      processes[command[0]][command[1]][command[2]](req, res);
    }
  } catch (e) {
    throw e;
  }
};

function getCommands() {
  return commands;
}

module.exports = { onApplicationCommand, getCommands };

