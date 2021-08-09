'use strict';

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

const onReady = async (client) => {
  if(process.env.TEST_GUILD_ID) {
    await client.guilds.cache.get(process.env.TEST_GUILD_ID)?.commands.set(commands);
  } else {
    await client.application?.commands.set(commands);
  }
};

const onInteractionCreate = async (client, interaction) => {
  if (!interaction.isCommand()) return;

  await interaction.deferReply();
  if(interaction.options.getSubcommand(false) === null) {
    await processes[interaction.commandName](client, interaction);
  } else {
    await processes[interaction.commandName][interaction.options.getSubcommandGroup(false)][interaction.options.getSubcommand(false)](client, interaction);
  }
};

module.exports = { onReady, onInteractionCreate };

