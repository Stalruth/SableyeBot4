import { InteractionResponseFlags, InteractionResponseType, MessageComponentTypes } from 'discord-interactions';
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
  ],
}

async function process(interaction, respond) {
  const args = getargs(interaction).params;

  const types = new Data.Generations(Dex).get(7).types;

  const result = types.getHiddenPower(args);

  const ivList = ['hp','atk','def','spa','spd','spe'].map(el => args[el]).join('/');
  const resultString = `Hidden Power is **${result['type']}-type**.`;

  return await respond({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      flags: InteractionResponseFlags.IS_COMPONENTS_V2,
      components: [
        {
          type: MessageComponentTypes.CONTAINER,
          accent_color: colours.types[Data.toID(result['type'])],
          components: [
            {
              type: MessageComponentTypes.TEXT_DISPLAY,
              content: `Given the IVs ${ivList},`
            },
            {
              type: MessageComponentTypes.TEXT_DISPLAY,
              content: resultString
            }
          ]
        }
      ]
    }
  });
}

export default {
  definition,
  command: {
    process
  },
}

