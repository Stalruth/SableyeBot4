import { InteractionResponseFlags, InteractionResponseType, MessageComponentTypes } from 'discord-interactions';
import Data from '@pkmn/data';
import { Dex } from '@pkmn/sim';

import getargs from '#utils/discord-getarg';
import { buildEmbed } from '#utils/embed-builder';
import colours from '#utils/pokemon-colours';

const definition = {
  description: 'Display the Hidden Power produced by the given DVs.',
  options: [
    {
      name: 'hp',
      type: 4,
      description: 'The Pokemon\'s HP DV, between 0 and 15.',
      required: true,
      min_value: 0,
      max_value: 15,
    },
    {
      name: 'atk',
      type: 4,
      description: 'The Pokemon\'s Attack DV, between 0 and 15.',
      required: true,
      min_value: 0,
      max_value: 15,
    },
    {
      name: 'def',
      type: 4,
      description: 'The Pokemon\'s Defence DV, between 0 and 15.',
      required: true,
      min_value: 0,
      max_value: 15,
    },
    {
      name: 'spc',
      type: 4,
      description: 'The Pokemon\'s Special DV, between 0 and 15.',
      required: true,
      min_value: 0,
      max_value: 15,
    },
    {
      name: 'spe',
      type: 4,
      description: 'The Pokemon\'s Speed DV, between 0 and 15.',
      required: true,
      min_value: 0,
      max_value: 15,
    },
  ],
}

async function process(interaction, respond) {
  const args = getargs(interaction).params;

  const types = new Data.Generations(Dex).get(2).types;

  // EXTREMELY FUNNY:
  // GSC DVs cap at 15 instead of 31; GSC also uses Spc instead of SpA and SpD.
  // @pkmn runs the conversion from RSE+ to GSC for this
  // ...so we have to do the reverse!
  const ivs = {
    'hp': args.hp * 2,
    'atk': args.atk * 2,
    'def': args.def * 2,
    'spa': args.spc * 2,
    'spe': args.spe * 2,
  };

  const result = types.getHiddenPower(ivs);

  const ivList = ['hp','atk','def','spc','spe'].map(el => args[el]).join('/');
  const resultString = `Hidden Power is **${result['type']}-type** and has **${result['power']}** Base Power.`;

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
              content: `Given the DVs ${ivList},`
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

