import { InteractionResponseType, InteractionResponseFlags, MessageComponentTypes } from 'discord-interactions';
import Data from '@pkmn/data';

import getargs from '#utils/discord-getarg';
import gens from '#utils/gen-db';
import colours from '#utils/pokemon-colours';
import { completePokemon, completeAttack, completeType, getMultiComplete, getAutocompleteHandler } from '#utils/pokemon-complete';

const definition = {
  description: 'Display type coverage based on a Pokémon\'s STAB and/or types.',
  options: [
    {
      name: 'pokemon',
      type: 3,
      description: 'Pokémon to check.',
      required: false,
      autocomplete: true,
    },
    {
      name: 'types',
      type: 3,
      description: 'Types to check, separated by commas.',
      required: false,
      autocomplete: true,
    },
    {
      name: 'moves',
      type: 3,
      description: 'Moves to check, separated by commas.',
      required: false,
      autocomplete: true,
    },
    {
      name: 'gen',
      type: 3,
      description: 'Generation to check against.',
      required: false,
      choices: gens.names,
    },
  ],
  integration_types: [0, 1],
  contexts: [0, 1, 2]
};

const neutralIfNotImmune = (base) => base !== 0 ? 1 : 0;
const overrides = {
  'flyingpress': (base, types, data) => base * data.types.totalEffectiveness('Flying',types),
  'freezedry': (base, types) => types.includes('Water') ? base * 4 : base,
  'thousandarrows': (base, types) => types.includes('Flying') ? 1 : base,
  'bide': neutralIfNotImmune,
  'counter': neutralIfNotImmune,
  'dragonrage': neutralIfNotImmune,
  'endeavor': neutralIfNotImmune,
  'finalgambit': neutralIfNotImmune,
  'guardianofalola': neutralIfNotImmune,
  'metalburst': neutralIfNotImmune,
  'mirrorcoat': neutralIfNotImmune,
  'naturesmadness': neutralIfNotImmune,
  'nightshade': neutralIfNotImmune,
  'psywave': neutralIfNotImmune,
  'seismictoss': neutralIfNotImmune,
  'sonicboom': neutralIfNotImmune,
  'superfang': neutralIfNotImmune,
};

const effectivenessModifier = new Proxy(overrides, {
  get: (target, name) => name in target ? target[name] : ((base, types, data) => base),
});

async function process(interaction, respond) {
  const args = getargs(interaction).params;

  if (!args.pokemon && !args.types && !args.moves) {
    return await respond({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        flags: InteractionResponseFlags.EPHEMERAL | InteractionResponseFlags.IS_COMPONENTS_V2,
        components: [
          {
            type: MessageComponentTypes.CONTAINER,
            accent_color: 0xCC0000,
            components: [
              {
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: `Please provide a Pokémon and/or at least one Type or Move.`
              }
            ]
          }
        ]
      }
    });
  }

  const data = gens.data[args.gen ? args.gen : 'natdex'];

  const pokemon = data.species.get(args.pokemon ?? '');

  if (args.pokemon && !pokemon) {
    return await respond({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        flags: InteractionResponseFlags.EPHEMERAL | InteractionResponseFlags.IS_COMPONENTS_V2,
        components: [
          {
            type: MessageComponentTypes.CONTAINER,
            accent_color: 0xCC0000,
            components: [
              {
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: `The Pokémon ${args.pokemon} does not exist in the given generation.`
              }
            ]
          }
        ]
      },
    });
  }

  const types = args.types?.split(',')?.map(t=>data.types.get(t)) ?? [];

  if (args.types) {
    const invalidTypes = [];
    types.forEach((el, i) => {
      if(!el) {
        invalidTypes.push(args.types.split(',')[i]);
      }
    });
    if (invalidTypes.length > 0) {
      const plural = invalidTypes.length > 1;
      return await respond({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          flags: InteractionResponseFlags.EPHEMERAL | InteractionResponseFlags.IS_COMPONENTS_V2,
          components: [
            {
              type: MessageComponentTypes.CONTAINER,
              accent_color: 0xCC0000,
              components: [
                {
                  type: MessageComponentTypes.TEXT_DISPLAY,
                  content: `The Type${plural ? 's' : ''} ${invalidTypes.join(', ')} do${plural ? '' : 'es'} not exist in the given generation.`
                }
              ]
            }
          ]
        },
      });
    }
  }

  const moves = args.moves?.split(',')?.map(t=>data.moves.get(t)) ?? [];

  if (args.moves) {
    const invalidMoves = [];
    moves.forEach((el, i) => {
      if(!el || el.category === 'Status') {
        invalidMoves.push(args.moves.split(',')[i]);
      }
    });
    if (invalidMoves.length > 0) {
      const plural = invalidMoves.length > 1;
      return await respond({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          flags: InteractionResponseFlags.EPHEMERAL | InteractionResponseFlags.IS_COMPONENTS_V2,
          components: [
            {
              type: MessageComponentTypes.CONTAINER,
              accent_color: 0xCC0000,
              components: [
                {
                  type: MessageComponentTypes.TEXT_DISPLAY,
                  content: `The Move${plural ? 's' : ''} ${invalidMoves.join(', ')} do${plural ? '' : 'es'} not exist in the given generation or ${plural ? 'are' : 'is a'} Status move${plural ? 's' : ''}.`
                }
              ]
            }
          ]
        },
      });
    }
  }

  const allTypes = [
    ...(pokemon?.types?.map(t=>data.types.get(t)) ?? []),
    ...types,
    ...moves,
  ];

  const results = {};

  for (const type of data.types) {
    if(type.id === 'stellar') {
      continue;
    }
    const effectiveness = allTypes.reduce((acc, cur) => {
      const attackType = cur.type ?? cur.name;
      const baseEffectiveness = data.types.totalEffectiveness(attackType, [type.name]);
      return Math.max(acc, effectivenessModifier[cur.id](baseEffectiveness, [type.name], data));
    }, 0);
    results[`${effectiveness}`] ??= [];
    results[`${effectiveness}`].push(type.name);
  }

  const titleParts = [];
  if (args.pokemon) {
    titleParts.push(`${pokemon.name} [${pokemon.types.join('/')}]`);
  }
  if (args.types || args.moves) {
    titleParts.push([...types, ...moves].map(t=>t.name).join(', '));
  }

  const fields = [];
  const fieldNames = {
    '0': 'Has no effect',
    '0.5': 'Not very effective (0.5x)',
    '1': 'Effective',
    '2': 'Super Effective (2x)',
  };
  for (const i of ['0', '0.5', '1', '2']) {
    if (results[i]) {
      fields.push({
        type: MessageComponentTypes.TEXT_DISPLAY,
        content: `### ${fieldNames[i]}\n${results[i].join(', ')}`,
      });
    }
  }

  return await respond({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      flags: InteractionResponseFlags.IS_COMPONENTS_V2,
      components: [
        {
          type: MessageComponentTypes.CONTAINER,
          accent_color: colours.types[allTypes[0].type?.toLowerCase() ?? allTypes[0].id],
          components: [
            {
              type: MessageComponentTypes.TEXT_DISPLAY,
              content: `# ${titleParts.join(' + ')}`
            },
            ...fields
          ]
        }
      ]
    },
  });
};

const autocomplete = {
  pokemon: getAutocompleteHandler(completePokemon, 'pokemon'),
  types: getAutocompleteHandler(getMultiComplete(gens.data['natdex'].types, completeType, {canNegate: false, canRepeat: false}), 'types'),
  moves: getAutocompleteHandler(getMultiComplete(gens.data['natdex'].moves, completeAttack, {canNegate: false, canRepeat: false}), 'moves'),
};

export default {
  definition,
  command: {
    process,
    autocomplete,
  }
};

