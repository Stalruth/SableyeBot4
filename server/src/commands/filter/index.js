import { ButtonStyleTypes, InteractionResponseFlags, InteractionResponseType, MessageComponentTypes } from 'discord-interactions';

import db from './db-service.js';
import getargs from '#utils/discord-getarg';
import { buildEmbed, buildError } from '#utils/embed-builder';
import gens from '#utils/gen-db';
import { completeAbility, completeMove, completeType, completePokemon, getMultiComplete, getAutocompleteHandler } from '#utils/pokemon-complete';
import { filterFactory, applyFilters } from './pokemon-filters.js';

import { componentIDs } from './component-index.js';

const natdex = gens.data['natdex'];

function paginate(array, limit) {
  const results = [''];
  array.forEach((el) => {
    const newItem = results[results.length - 1] === '' ? el : ', ' + el;
    if(results[results.length - 1].length + newItem.length > limit) {
      if(el.length > limit) {
        throw `Item ${el} greater than limit ${limit}`;
      }
      results.push(el);
      return;
    }
    results[results.length  -1] += newItem;
  });
  return results;
}

const definition = {
  description: 'Search for Pokémon fitting the given conditions.',
  options: [
    {
      name: 'abilities',
      type: 3,
      description: 'Can have the Abilities given, separated by commas.',
      autocomplete: true,
    },
    {
      name: 'breeds-with',
      type: 3,
      description: 'Can breed with the given Pokémon, separated by commas.',
      autocomplete: true,
    },
    {
      name: 'has-evo',
      type: 5,
      description: 'Has (or does not have) an evolution.',
    },
    {
      name: 'has-prevo',
      type: 5,
      description: 'Has (or does not have) a pre-evolution.',
    },
    {
      name: 'moves',
      type: 3,
      description: 'Can learn the moves given (besides Sketch), separated by commas and negated with `!`.',
      autocomplete: true,
    },
    {
      name: 'resists',
      type: 3,
      description: 'Resists damage from the types given (ignores Ability), separated by commas and negated with `!`.',
      autocomplete: true,
    },
    {
      name: 'types',
      type: 3,
      description: 'Has all of the types given, separated by commas and negated with `!`.',
      autocomplete: true,
    },
    {
      name: 'vgc-legality',
      type: 3,
      description: "Is legal in certain VGC formats.",
      choices: [
        {
          name: 'No Legendaries',
          value: 'commons',
        },
        {
          name: 'VGC Legal',
          value: 'vgc',
        },
        {
          name: 'GS Cup Legal',
          value: 'gsc',
        },
        {
          name: 'Restricted Legendary',
          value: 'gsc-restricted',
        },
        {
          name: 'Always Banned',
          value: 'banned',
        },
      ],
    },
    {
      name: 'weaknesses',
      type: 3,
      description: 'Is weak to damage from the types given (ignores Ability), separated by commas and negated with `!`.',
      autocomplete: true,
    },
    {
      name: 'weight-kg',
      type: 3,
      description: "Weight in kg. (Supports `<STAT`, `>STAT`, `=STAT`, `STAT-STAT`)",
    },
    {
      name: 'height-m',
      type: 3,
      description: "Height in metres. (Supports `<STAT`, `>STAT`, `=STAT`, `STAT-STAT`)",
    },
    {
      name: 'hp',
      type: 3,
      description: "Base HP. (Supports `<STAT`, `>STAT`, `=STAT`, `STAT-STAT`)",
    },
    {
      name: 'atk',
      type: 3,
      description: "Base Attack. (Supports `<STAT`, `>STAT`, `=STAT`, `STAT-STAT`)",
    },
    {
      name: 'def',
      type: 3,
      description: "Base Defence. (Supports `<STAT`, `>STAT`, `=STAT`, `STAT-STAT`)",
    },
    {
      name: 'spa',
      type: 3,
      description: "Base Special Attack. (Supports `<STAT`, `>STAT`, `=STAT`, `STAT-STAT`)",
    },
    {
      name: 'spd',
      type: 3,
      description: "Base Special Defence. (Supports `<STAT`, `>STAT`, `=STAT`, `STAT-STAT`)",
    },
    {
      name: 'spe',
      type: 3,
      description: "Base Speed. (Supports `<STAT`, `>STAT`, `=STAT`, `STAT-STAT`)",
    },
    {
      name: 'bst',
      type: 3,
      description: "Base Stat Total. (Supports `<STAT`, `>STAT`, `=STAT`, `STAT-STAT`)",
    },
    {
      name: 'gen',
      type: 3,
      description: 'The Games the results apply to.',
      choices: gens.names,
    },
    {
      name: 'transfer-moves',
      type: 5,
      description: 'Include moves learned in past gens. (Enabled by default unless `gen` is Scarlet/Violet)',
    },
    {
      name: 'sort',
      type: 3,
      description: 'Sort results by the given stat (High to Low)',
      choices: [
        {
          name: 'HP',
          value: 'hp',
        },
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
        {
          name: 'Base Stat Total',
          value: 'bst',
        },
      ],
    },
    {
      name: 'threshold',
      type: 4,
      description: 'Amount of filters that must match. Comma-separated fields count once for each item.',
      min_value: 1,
    },
  ],
  integration_types: [0, 1],
  contexts: [0, 1, 2]
};

async function process(interaction, respond) {
  const args = getargs(interaction).params;

  const gen = args.gen ?? 'natdex';
  const data = gens.data[gen];
  const filters = [];
  const isVgc = !(args['transfer-moves'] ?? (gen !== 'gen9'));

  if(args.abilities) {
    const abilities = args.abilities.split(',');
    for(const ability of abilities) {
      if(data.abilities.get(ability)?.exists) {
        filters.push(filterFactory['ability'](gen, ability, isVgc));
      } else {
        return await respond({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            flags: InteractionResponseFlags.EPHEMERAL | InteractionResponseFlags.IS_COMPONENTS_V2,
            components: [{
              type: MessageComponentTypes.CONTAINER,
              accent_color: 0xCC0000,
              components: [
                {
                  type: MessageComponentTypes.TEXT_DISPLAY,
                  content: `The ability ${ability} could not be found in the given generation.`
                }
              ]
            }]
          }
        });
      }
    }
  }

  if(args.types) {
    const types = args.types.split(',');
    for(const type of types) {
      if(data.types.get(type)?.exists) {
        filters.push(filterFactory['type'](gen, type, isVgc));
      } else {
        return await respond({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            flags: InteractionResponseFlags.EPHEMERAL | InteractionResponseFlags.IS_COMPONENTS_V2,
            components: [{
              type: MessageComponentTypes.CONTAINER,
              accent_color: 0xCC0000,
              components: [
                {
                  type: MessageComponentTypes.TEXT_DISPLAY,
                  content: `The type ${type} could not be found in the given generation.`
                }
              ]
            }]
          }
        });
      }
    }
  }

  if(args.moves) {
    const moves = args.moves.split(',');
    for(const move of moves) {
      if(data.moves.get(move)?.exists) {
        filters.push(filterFactory['move'](gen, move, isVgc));
      } else {
        return await respond({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            flags: InteractionResponseFlags.EPHEMERAL | InteractionResponseFlags.IS_COMPONENTS_V2,
            components: [{
              type: MessageComponentTypes.CONTAINER,
              accent_color: 0xCC0000,
              components: [
                {
                  type: MessageComponentTypes.TEXT_DISPLAY,
                  content: `The move ${move} could not be found in the given generation.`
                }
              ]
            }]
          }
        });
      }
    }
  }

  for (const stat of ['hp','atk','def','spa','spd','spe','bst']) {
    if(args[stat]) {
      let match = false;
      if(args[stat].startsWith('<') || args[stat].startsWith('>') || args[stat].startsWith('=')) {
        match = !isNaN(args[stat].slice(1));
      } else {
        match = !(args[stat].split('-').some(e => isNaN(e)));
      }
      if(match) {
        filters.push(filterFactory[stat](gen, args[stat], isVgc));
      } else {
        return await respond({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            flags: InteractionResponseFlags.EPHEMERAL | InteractionResponseFlags.IS_COMPONENTS_V2,
            components: [{
              type: MessageComponentTypes.CONTAINER,
              accent_color: 0xCC0000,
              components: [
                {
                  type: MessageComponentTypes.TEXT_DISPLAY,
                  content: `The query ${args[stat]} is not valid for the '${stat}' argument.`
                }
              ]
            }]
          }
        });
      }
    }
  }

  for (const stat of ['weight-kg','height-m']) {
    if(args[stat]) {
      let match = false;
      if(args[stat].startsWith('<') || args[stat].startsWith('>') || args[stat].startsWith('=')) {
        match = !isNaN(args[stat].slice(1));
      } else {
        match = !(args[stat].split('-').some(e => isNaN(e)));
      }
      if(match) {
        filters.push(filterFactory[stat](gen, args[stat], isVgc));
      } else {
        return await respond({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            flags: InteractionResponseFlags.EPHEMERAL | InteractionResponseFlags.IS_COMPONENTS_V2,
            components: [{
              type: MessageComponentTypes.CONTAINER,
              accent_color: 0xCC0000,
              components: [
                {
                  type: MessageComponentTypes.TEXT_DISPLAY,
                  content: `The query ${args[stat]} is not valid for the '${stat}' argument.`
                }
              ]
            }]
          }
        });
      }
    }
  }

  if(args.weaknesses) {
    const types = args.weaknesses.split(',');
    for(const type of types) {
      if(data.types.get(type)?.exists) {
        filters.push(filterFactory['weakness'](gen, type, isVgc));
      } else {
        return await respond({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            flags: InteractionResponseFlags.EPHEMERAL | InteractionResponseFlags.IS_COMPONENTS_V2,
            components: [{
              type: MessageComponentTypes.CONTAINER,
              accent_color: 0xCC0000,
              components: [
                {
                  type: MessageComponentTypes.TEXT_DISPLAY,
                  content: `The type ${type} could not be found in the given generation.`
                }
              ]
            }]
          }
        });
      }
    }
  }

  if(args.resists) {
    const types = args.resists.split(',');
    for(const type of types) {
      if(data.types.get(type)?.exists) {
        filters.push(filterFactory['resist'](gen, type, isVgc));
      } else {
        return await respond({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            flags: InteractionResponseFlags.EPHEMERAL | InteractionResponseFlags.IS_COMPONENTS_V2,
            components: [{
              type: MessageComponentTypes.CONTAINER,
              accent_color: 0xCC0000,
              components: [
                {
                  type: MessageComponentTypes.TEXT_DISPLAY,
                  content: `The type ${type} could not be found in the given generation.`
                }
              ]
            }]
          }
        });
      }
    }
  }

  if(args['breeds-with']) {
    const partners = args['breeds-with'].split(',');
    for(const partner of partners) {
      if(data.species.get(partner)?.exists) {
        filters.push(filterFactory['breeds-with'](gen, partner, isVgc));
      } else {
        return await respond({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            flags: InteractionResponseFlags.EPHEMERAL | InteractionResponseFlags.IS_COMPONENTS_V2,
            components: [{
              type: MessageComponentTypes.CONTAINER,
              accent_color: 0xCC0000,
              components: [
                {
                  type: MessageComponentTypes.TEXT_DISPLAY,
                  content: `The Pokémon ${partner} could not be found in the given generation.`
                }
              ]
            }]
          }
        });
      }
    }
  }

  if(args['has-evo'] !== undefined) {
    filters.push(filterFactory['has-evo'](gen, args['has-evo'], isVgc));
  }

  if(args['has-prevo'] !== undefined) {
    filters.push(filterFactory['has-prevo'](gen, args['has-prevo'], isVgc));
  }

  if(args['vgc-legality'] !== undefined) {
    filters.push(filterFactory['vgc-legality'](gen, args['vgc-legality'], isVgc));
  }

  if(filters.length === 0) {
    return await respond({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        flags: InteractionResponseFlags.EPHEMERAL | InteractionResponseFlags.IS_COMPONENTS_V2,
        components: [{
          type: MessageComponentTypes.CONTAINER,
          accent_color: 0xCC0000,
          components: [
            {
              type: MessageComponentTypes.TEXT_DISPLAY,
              content: "You haven't added any filters."
            }
          ]
        }]
      }
    });
  }

  await respond({
    type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE
  });

  const threshold = args.threshold ?? filters.length;

  const sortKey = args['sort'];
  // TODO: clean up

  const results = (await applyFilters(gen, filters, threshold)).sort((lhs, rhs) => {
    if (!sortKey) {
      return 0;
    }
    if (sortKey === 'bst') {
      return rhs.bst - lhs.bst;
    }
    return rhs.baseStats[sortKey] - lhs.baseStats[sortKey];
  });

  const pages = paginate(results.map((el)=>{return el.name}), 1000);
  if (pages.length > 1) {
    db.getFilterCollection().insert({
      interactionId: interaction.id,
      pages,
      webhook: {
        token: interaction.token,
        appId: interaction.application_id,
      }
    });
  }

  const genNumbers = {
    'gen1': 'Generation 1',
    'gen2': 'Generation 2',
    'gen3': 'Generation 3',
    'gen4': 'Generation 4',
    'gen5': 'Generation 5',
    'gen6': 'Generation 6',
    'gen7': 'Generation 7',
    'gen8': 'Generation 8',
    'gen9': 'Generation 9',
    'natdex': 'National Pokédex'
  };
  let notes = "### Notes";
  notes += `\n- ${genNumbers[gen]}`;
  notes += `\n- Transferred Pokémon are ${isVgc ? 'Excluded' : 'Included'}`;
  if(threshold !== filters.length) {
    notes += `\n- At least ${threshold} filter${threshold === 1 ? '' : 's'} must match`;
  }
  if(sortKey) {
    const names = {
      'hp': 'Hit Points',
      'atk': 'Attack',
      'def': 'Defence',
      'spa': 'Special Attack',
      'spd': 'Special Defence',
      'spe': 'Speed',
      'bst': 'Base Stat Total',
    };
    notes += `\n- Sorted by ${names[sortKey]} (High to Low)`;
  }

  const pageList = pages.map((e, i) => i + 1).filter(e => e <= 4 || e === pages.length);

  const buttonBar = (pages.length === 1 ? [] : [
    {
      type: MessageComponentTypes.ACTION_ROW,
      id: componentIDs.BUTTON_BAR,
      components: pageList.map(page => ({
        type: MessageComponentTypes.BUTTON,
        custom_id: page === 1 ? '-' : `${page}`,
        disabled: page === 1,
        style: ButtonStyleTypes.SECONDARY,
        label: `Page ${page}`,
      }))
    }
  ]);

  const components = [
    {
      type: MessageComponentTypes.TEXT_DISPLAY,
      id: componentIDs.FILTERS,
      content: `### Filters\n${filters.map(el=>`- ${el['description']}`).join('\n')}`
    },
    {
      type: MessageComponentTypes.TEXT_DISPLAY,
      id: componentIDs.RESULTS,
      content: pages[0].length ? `### Results (${results.length})\n${pages[0]}` : '### No results found.'
    },
    ...buttonBar,
    {
      type: MessageComponentTypes.TEXT_DISPLAY,
      id: componentIDs.NOTES,
      content: notes
    }
  ]

  await respond({
    flags: InteractionResponseFlags.IS_COMPONENTS_V2,
    components: [
      {
        type: MessageComponentTypes.CONTAINER,
        accent_color: 0x5F32AB,
        id: componentIDs.ROOT,
        components,
      }
    ]
  });
}

const autocomplete = {
  abilities: getAutocompleteHandler(getMultiComplete(natdex.abilities, completeAbility, {canNegate: false, canRepeat: true}), 'abilities'),
  types: getAutocompleteHandler(getMultiComplete(natdex.types, completeType, {canNegate: true, canRepeat: true}), 'types'),
  moves: getAutocompleteHandler(getMultiComplete(natdex.moves, completeMove, {canNegate: true, canRepeat: true}), 'moves'),
  weaknesses: getAutocompleteHandler(getMultiComplete(natdex.types, completeType, {canNegate: true, canRepeat: true}), 'weaknesses'),
  resists: getAutocompleteHandler(getMultiComplete(natdex.types, completeType, {canNegate: true, canRepeat: true}), 'resists'),
  'breeds-with': getAutocompleteHandler(getMultiComplete(natdex.species, completePokemon, {canNegate: false, canRepeat: true}), 'breeds-with'),
};

export default {
  definition,
  command: {
    process,
    autocomplete,
  }
};

