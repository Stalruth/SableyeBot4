'use strict';

const { InteractionResponseType } = require('discord-interactions');
const Data = require('@pkmn/data');
const Sim = require('@pkmn/sim');

const getargs = require('discord-getarg');
const buildEmbed = require('embed-builder');

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
      type: 3,
      description: 'Name of the stat boosted by the Nature.',
      required: true,
      choices: stats
    },
    {
      name: 'lowered',
      type: 3,
      description: 'Name of the stat lowered by the Nature.',
      required: true,
      choices: stats
    },
  ],
}

const process = (interaction) => {
  const args = getargs(interaction).params;

  const gen = new Data.Generations(Sim.Dex).get(8);
  
  // Uh oh sisters! hardcoding!
  const neutralNatures = {
    atk: 'Hardy',
    def: 'Docile',
    spa: 'Bashful',
    spd: 'Quirky',
    spe: 'Serious',
  };
  
  let title = '';
  let fields = [
    {
      name: 'Boosted',
      value: args.boosted.toUpperCase(),
      inline: true,
    },
    {
      name: 'Lowered',
      value: args.lowered.toUpperCase(),
      inline: true,
    }
  ]
  
  if(args.boosted === args.lowered) {
    title = neutralNatures[args.boosted];
  }

  for(const nature of gen.natures) {
    if (nature.plus === args.boosted && nature.minus === args.lowered) {
      title = nature.name;
      break;
    }
  }

  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      embeds: [buildEmbed({
        title,
        fields,
      })],
    },
  };
}

module.exports = {command, process}

