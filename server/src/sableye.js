import { addCommand, onApplicationCommand, onAutocomplete } from './handlers/AppCommandHandler.js';
import { addComponent, onComponentInteraction } from './handlers/MessageComponentHandler.js';
import { onPingInteraction } from './handlers/PingHandler.js';

addCommand('about', await import('./commands/about/index.js'));
addCommand('calculator', await import('./commands/calculator/index.js'));
addCommand('coverage', await import('./commands/coverage/index.js'));
addCommand('data', await import('./commands/data/index.js'));
addCommand('dt', await import('./commands/data/dt.js'));
addCommand('event', await import('./commands/event/index.js'));
addCommand('filter', await import('./commands/filter/index.js'));
addCommand('hiddenpower', await import('./commands/hiddenpower/index.js'));
addCommand('learn', await import('./commands/learn/index.js'));
addCommand('linkcode', await import('./commands/linkcode/index.js'));
addCommand('nature', await import('./commands/nature/index.js'));
addCommand('sprite', await import('./commands/sprite/index.js'));
addCommand('weakness', await import('./commands/weakness/index.js'));

addCommand('Pokémon Glossary', await import('./commands/Pokémon Glossary/index.js'));
addCommand('Get Linking Code', await import('./commands/Get Linking Code/index.js'));

addComponent('filter', await import('./commands/filter/component.js'));
addComponent('data', await import('./commands/data/component.js'));
addComponent('dt', await import('./commands/data/component.js'));
addComponent('learn', await import('./commands/learn/component.js'));
addComponent('Pokémon Glossary', await import('./commands/Pokémon Glossary/component.js'));

const handlers = {
  1: onPingInteraction,
  2: onApplicationCommand,
  3: onComponentInteraction,
  4: onAutocomplete
};

const sableye = (req, res) => {
  handlers[req.body['type']](req, res);
};

export { sableye };

