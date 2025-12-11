import { InteractionResponseFlags, InteractionResponseType, MessageComponentTypes } from 'discord-interactions';
import Data from '@pkmn/data';
import { Dex } from '@pkmn/sim';

import getargs from '#utils/discord-getarg';
import { buildEmbed } from '#utils/embed-builder';
import colours from '#utils/pokemon-colours';

const types = new Data.Generations(Dex).get(7).types;

const listTypes = function(typeList) {
  const result = [];
  for(const type of typeList) {
    result.push({
      name: type['name'],
      value: type['id'],
    });
  }
  return result;
}

const definition = {
  description: 'Display the "best" IVs that result in a Hidden Power of the given Type.',
  options: [
    {
      name: 'type',
      type: 3,
      description: 'The Type to look up.',
      required: true,
      choices: listTypes(types),
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
  const type = types.get(args.type);

  if(!type || ['normal','fairy'].includes(type['id'])) {
    const typeName = type ? type['name'] : args.type;
    return respond({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        flags: InteractionResponseFlags.IS_COMPONENTS_V2,
        components: [
          {
            type: MessageComponentTypes.CONTAINER,
            accent_color: colours.types[Data.toID(typeName)],
            components: [
              {
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: `# Hidden Power ${typeName}\nThere is no way to get a ${typeName}-Type Hidden Power`
              }
            ]
          }
        ]
      }
    });
  }

  const stats = {...{
    hp: args.gen == 2 ? 15 : 31,
    atk: args.gen == 2 ? 15 : 31,
    def: args.gen == 2 ? 15 : 31,
    spa: args.gen == 2 ? undefined : 31,
    spd: args.gen == 2 ? undefined : 31,
    spc: args.gen == 2 ? 15 : undefined,
    spe: args.gen == 2 ? 15 : 31,
  }, ...(args.gen == 2 ? type.HPdvs : type.HPivs)};

  const statList = [
    'hp',
    'atk',
    'def',
    ...(
      args.gen === 2 ? ['spc'] : ['spa', 'spd']
    ),
    'spe'
  ];

  const statNames = {
    'hp': 'HP',
    'atk': 'Attack',
    'def': 'Defence',
    'spc': 'Special',
    'spa': 'Special Attack',
    'spd': 'Special Defence',
    'spe': 'Speed'
  };

  const transformer = (el, ind, arr) => `${ind == arr.length - 1 ? 'and ' : ''}**${statNames[el]}**`
  const odds = statList.filter(el => stats[el] % 2 == 1).map(transformer);
  const evens = statList.filter(el => stats[el] % 2 == 0).map(transformer);
  const oddString = `- The ${odds.join(odds.length == 2 ? ' ' : ', ')} IVs should be **Odd**.\n`;
  const evenString = `- The ${evens.join(evens.length == 2 ? ' ' : ', ')} IVs should be **Even**.`;

  return await respond({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      flags: InteractionResponseFlags.IS_COMPONENTS_V2,
      components: [
        {
          type: MessageComponentTypes.CONTAINER,
          accent_color: colours.types[Data.toID(type['name'])],
          components: [
            {
              type: MessageComponentTypes.TEXT_DISPLAY,
              content: `# Hidden Power ${type['name']}\nFor a ${type['name']}-Type Hidden Power:\n${odds.length == 0 ? '' : oddString}${evens.length == 0 ? '' : evenString}`
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

