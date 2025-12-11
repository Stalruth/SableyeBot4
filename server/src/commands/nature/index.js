import { InteractionResponseType, InteractionResponseFlags, MessageComponentTypes } from 'discord-interactions';
import Data from '@pkmn/data';
import { Dex } from '@pkmn/sim';

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
  integration_types: [0, 1],
  contexts: [0, 1, 2]
}

async function process(interaction, respond) {
  const args = getargs(interaction).params;

  const gen = new Data.Generations(Dex).get(8);

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
  if(args.boosted === args.lowered) {
    title = neutralNatures[args.boosted];
  } else {
    for(const nature of gen.natures) {
      if (nature.plus === args.boosted && nature.minus === args.lowered) {
        title = nature.name;
        break;
      }
    }
  }

  const description = (args.boosted === args.lowered ? [{
    type: MessageComponentTypes.TEXT_DISPLAY,
    content: 'This nature does not affect the Pokémon\'s stats.'
  }] : [{
      type: MessageComponentTypes.TEXT_DISPLAY,
      content: `Boosts **${fullNames[args.boosted]}**.`
    },
    {
      type: MessageComponentTypes.TEXT_DISPLAY,
      content: `Lowers **${fullNames[args.lowered]}**.`
    }
  ]);

  return await respond({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      flags: InteractionResponseFlags.IS_COMPONENTS_V2,
      components: [
        {
          type: MessageComponentTypes.CONTAINER,
          accent_color: colours.stats[args.boosted],
          components: [
            {
              type: MessageComponentTypes.TEXT_DISPLAY,
              content: `# ${title} Nature`
            },
            ...description
          ]
        }
      ]
    },
  });
}

export default {
  definition,
  command: {
    process,
  }
};

