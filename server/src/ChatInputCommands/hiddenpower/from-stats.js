import { InteractionResponseFlags, InteractionResponseType } from 'discord-interactions';
import Data from '@pkmn/data';
import { Dex } from '@pkmn/sim';

import getargs from '#utils/discord-getarg';
import { buildEmbed } from '#utils/embed-builder';
import colours from '#utils/pokemon-colours';

const definition = {
  description: 'Display the Hidden Power produced by the given IVs.',
  options: [
    {
      name: 'hp',
      type: 4,
      description: 'The Pokemon\'s HP IV, between 0 and 31.',
      required: true,
      min_value: 0,
      max_value: 31,
    },
    {
      name: 'atk',
      type: 4,
      description: 'The Pokemon\'s Attack IV, between 0 and 31.',
      required: true,
      min_value: 0,
      max_value: 31,
    },
    {
      name: 'def',
      type: 4,
      description: 'The Pokemon\'s Defence IV, between 0 and 31.',
      required: true,
      min_value: 0,
      max_value: 31,
    },
    {
      name: 'spa',
      type: 4,
      description: 'The Pokemon\'s Special Attack IV, between 0 and 31.',
      required: true,
      min_value: 0,
      max_value: 31,
    },
    {
      name: 'spd',
      type: 4,
      description: 'The Pokemon\'s Special Defence IV, between 0 and 31.',
      required: true,
      min_value: 0,
      max_value: 31,
    },
    {
      name: 'spe',
      type: 4,
      description: 'The Pokemon\'s Speed IV, between 0 and 31.',
      required: true,
      min_value: 0,
      max_value: 31,
    },
    {
      name: 'gen',
      type: 4,
      description: 'The Generation to calculate for.',
      choices: [
        {
          name: 'GSC',
          value: 2,
        },
        {
          name: 'RSE',
          value: 3,
        },
        {
          name: 'DPPt/HGSS',
          value: 4,
        },
        {
          name: 'BW/BW2',
          value: 5,
        },
        {
          name: 'XY/ORAS',
          value: 6,
        },
        {
          name: 'SM/USM',
          value: 7,
        },
      ]
    },
  ],
}

async function process(interaction, respond) {
  const args = getargs(interaction).params;
  args.gen ??= 7;

  const types = new Data.Generations(Dex).get(args.gen).types;

  const result = types.getHiddenPower(args);

  return await respond({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      embeds: [buildEmbed({
        fields : [
          {
            name: 'Type',
            value: result['type'],
            inline: true,
          },
          {
            name: 'Power',
            value: result['power'],
            inline: true,
          },
        ],
        color: colours.types[Data.toID(result['type'])]
      })],
    },
  });
}

export default {
  definition,
  command: {
    process
  },
}

