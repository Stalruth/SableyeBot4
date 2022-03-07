'use strict';

const { addCommand, onApplicationCommand, onAutocomplete } = require('./handlers/AppCommandHandler.js');
const { addComponent, onComponentInteraction } = require('./handlers/MessageComponentHandler.js');

addCommand('about', require('./ChatInputCommands/about.js'));
addCommand('calculator', require('./ChatInputCommands/calculator.js'));
addCommand('coverage', require('./ChatInputCommands/coverage.js'));
addCommand('dt', require('./ChatInputCommands/dt.js'));
addCommand('event', require('./ChatInputCommands/event.js'));
addCommand('filter', require('./ChatInputCommands/filter.js'));
addCommand('hiddenpower', require('./ChatInputCommands/hiddenpower.js'));
addCommand('learn', require('./ChatInputCommands/learn.js'));
addCommand('nature', require('./ChatInputCommands/nature.js'));
addCommand('sprite', require('./ChatInputCommands/sprite.js'));
addCommand('weakness', require('./ChatInputCommands/weakness.js'));

addCommand('Search', require('./ContextMenuCommands/Search.js'));

addComponent('filter', require('./MessageComponents/filter.js'));
addComponent('dt', require('./MessageComponents/dt.js'));
addComponent('Search', require('./MessageComponents/dt.js'));

const handlers = {
  2: onApplicationCommand,
  3: onComponentInteraction,
  4: onAutocomplete
};

module.exports.sableye = (req, res) => {
  handlers[req.body['type']](req, res);
};

