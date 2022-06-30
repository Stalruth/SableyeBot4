import { addCommand, onApplicationCommand, onAutocomplete } from './handlers/AppCommandHandler.js';
import { addComponent, onComponentInteraction } from './handlers/MessageComponentHandler.js';

addCommand('about', await import('./ChatInputCommands/about.js'));
addCommand('calculator', await import('./ChatInputCommands/calculator.js'));
addCommand('coverage', await import('./ChatInputCommands/coverage.js'));
addCommand('data', await import('./ChatInputCommands/data.js'));
addCommand('dt', await import('./ChatInputCommands/dt.js'));
addCommand('event', await import('./ChatInputCommands/event.js'));
addCommand('filter', await import('./ChatInputCommands/filter.js'));
addCommand('hiddenpower', await import('./ChatInputCommands/hiddenpower.js'));
addCommand('learn', await import('./ChatInputCommands/learn.js'));
addCommand('linkcode', await import('./ChatInputCommands/linkcode.js'));
addCommand('nature', await import('./ChatInputCommands/nature.js'));
addCommand('sprite', await import('./ChatInputCommands/sprite.js'));
addCommand('usage', await import('./ChatInputCommands/usage.js'));
addCommand('weakness', await import('./ChatInputCommands/weakness.js'));

addCommand('Pokémon Glossary', await import('./ContextMenuCommands/Pokémon Glossary.js'));
addCommand('Get Linking Code', await import('./ContextMenuCommands/Get Linking Code.js'));

addComponent('filter', await import('./MessageComponents/filter.js'));
addComponent('data', await import('./MessageComponents/data.js'));
addComponent('dt', await import('./MessageComponents/dt.js'));
addComponent('Pokémon Glossary', await import('./MessageComponents/dt.js'));
addComponent('usage', await import('./MessageComponents/usage.js'));

const handlers = {
  2: onApplicationCommand,
  3: onComponentInteraction,
  4: onAutocomplete
};

const sableye = (req, res) => {
  handlers[req.body['type']](req, res);
};

export { sableye };

