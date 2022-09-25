import { InteractionResponseType } from 'discord-interactions';
import Data from '@pkmn/data';
import Sim from '@pkmn/sim';

import colours from '#utils/pokemon-colours';
import getargs from '#utils/discord-getarg';
import { buildEmbed } from '#utils/embed-builder';

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

const definition = {
  description: 'Search for a Nature with the effect described.',
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

async function process(interaction, respond) {
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

  const fullNames = {
    'atk': 'Attack',
    'def': 'Defence',
    'spa': 'Special Attack',
    'spd': 'Special Defence',
    'spe': 'Speed',
  };

  let title = '';
  let fields = [
    {
      name: 'Boosted',
      value: fullNames[args.boosted],
      inline: true,
    },
    {
      name: 'Lowered',
      value: fullNames[args.lowered],
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

  return await respond({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      embeds: [buildEmbed({
        title,
        fields,
        color: colours.stats[args.boosted],
      })],
    },
  });
}

export default {
  definition,
  command: {
    process,
  }
};

