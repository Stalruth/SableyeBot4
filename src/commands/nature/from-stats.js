'use strict';

let Dex = require('@pkmn/dex');
let Data = require('@pkmn/data');

const stats = [
  {
    name: 'Attack',
    value: 'atk',
  },
  {
    name: 'Defence',
    value: 'def',
  },
  {
    name: 'Special Attack',
    value: 'spa',
  },
  {
    name: 'Special Defence',
    value: 'spd',
  },
  {
    name: 'Speed',
    value: 'spe',
  },
];

const command = {
  description: 'Returns the Nature that affects the stats provided.',
  options: [
    {
      name: 'boosted',
      type: 'STRING',
      description: 'Name of the stat boosted by the Nature.',
      required: true,
      choices: stats
    },
    {
      name: 'lowered',
      type: 'STRING',
      description: 'Name of the stat lowered by the Nature.',
      required: true,
      choices: stats
    },
  ],
}

const process = async (client, interaction) => {
  const gen = new Data.Generations(Dex.Dex).get(8);
  const boosted = interaction.options.getString('boosted');
  const lowered = interaction.options.getString('lowered');

  if (boosted === lowered) {
    await interaction.reply(`The Natures without any effect are Hardy, Docile, Bashful, Quirky and Serious.`);
  }

  for(const nature of gen.natures) {
    if (nature.plus === boosted && nature.minus === lowered) {
      await interaction.reply(`${nature.name}: +${boosted.toUpperCase()} -${lowered.toUpperCase()}`);
      break;
    }
  }
}

module.exports = {command, process}

