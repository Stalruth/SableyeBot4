'use strict';

const { performance } = require('perf_hooks');

const commands = [];
const processes = {};

const addCommand = async function(name, module) {
  const {command, process} = module;
  command['name'] = name;
  commands.push(command);
  processes[name] = process;
};

addCommand('nature', require('./commands/nature.js'));
addCommand('calculator', require('./commands/calculator.js'));
addCommand('hiddenpower', require('./commands/hiddenpower.js'));
addCommand('about', require('./commands/about.js'));
addCommand('ability', require('./commands/ability.js'));
addCommand('move', require('./commands/move.js'));
addCommand('item', require('./commands/item.js'));
addCommand('pokemon', require('./commands/pokemon.js'));
addCommand('dt', require('./commands/dt.js'));
addCommand('event', require('./commands/event.js'));
addCommand('sprite', require('./commands/sprite.js'));
addCommand('coverage', require('./commands/coverage.js'));
addCommand('learn', require('./commands/learn.js'));
addCommand('weakness', require('./commands/weakness.js'));
addCommand('filter', require('./commands/filter.js'));

const onInteractionCreate = async (req, res) => {
  const command = [req.body.data?.name];

  if([1,2].includes(req.body.data?.options?.[0]?.type)) {
    command.push(req.body.data.options[0].name);
    if(req.body.data.options[0].options?.[0]?.type === 1) {
      command.push(req.body.data.options[0].options[0].name);
    }
  }

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

module.exports = { onInteractionCreate };

