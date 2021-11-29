'use strict';

const { InteractionResponseFlags, InteractionResponseType } = require('discord-interactions');
const Data = require('@pkmn/data');

const toArray = require('dexdata-toarray');
const getargs = require('discord-getarg');
const buildEmbed = require('embed-builder');
const gens = require('gen-db');
const paginate = require('paginate');
const { completeAbility, completeFilterType, completeMove, completeType } = require('pkmn-complete');
const { filterFactory, applyFilters, packFilters } = require('pokemon-filters');

const command = {
  description: 'Get all Pokémon fitting the given conditions.',
  options: [
    {
      name: 'abilities',
      type: 3,
      description: 'Comma delimited list of Abilities the Pokémon must have.',
      autocomplete: true,
    },
    {
      name: 'egg-group',
      type: 3,
      description: 'Egg Group the Pokémon must be in.',
      choices: [
        {
          name: 'Amorphous',
          value: 'Amorphous',
        },
        {
          name: 'Bug',
          value: 'Bug',
        },
        {
          name: 'Dragon',
          value: 'Dragon',
        },
        {
          name: 'Ditto',
          value: 'Ditto',
        },
        {
          name: 'Fairy',
          value: 'Fairy',
        },
        {
          name: 'Field',
          value: 'Field',
        },
        {
          name: 'Flying',
          value: 'Flying',
        },
        {
          name: 'Grass',
          value: 'Grass',
        },
        {
          name: 'Human-Like',
          value: 'Human-Like',
        },
        {
          name: 'Mineral',
          value: 'Mineral',
        },
        {
          name: 'Monster',
          value: 'Monster',
        },
        {
          name: 'Undiscovered',
          value: 'Undiscovered',
        },
        {
          name: 'Water 1',
          value: 'Water 1',
        },
        {
          name: 'Water 2',
          value: 'Water 2',
        },
        {
          name: 'Water 3',
          value: 'Water 3',
        },
      ],
    },
    {
      name: 'evolves',
      type: 5,
      description: 'Has (or does not have) an evolution.',
    },
    {
      name: 'has-evolved',
      type: 5,
      description: 'Has (or does not have) a pre-evolution',
    },
    {
      name: 'moves',
      type: 3,
      description: 'Comma delimited list of moves.',
      autocomplete: true,
    },
    {
      name: 'resists',
      type: 3,
      description: "Comma delimited list of Resistances.",
      autocomplete: true,
    },
    {
      name: 'types',
      type: 3,
      description: 'Comma delimited list of types. Prefix a type with `!` to negate.',
      autocomplete: true,
    },
    {
      name: 'weaknesses',
      type: 3,
      description: "Comma delimited list of Weaknesses.",
      autocomplete: true,
    },
    {
      name: 'weight-kg',
      type: 3,
      description: "Weight in kg, supports `<STAT`, `>STAT`, `STAT-STAT`",
    },
    {
      name: 'height-m',
      type: 3,
      description: "Height in metres, supports `<STAT`, `>STAT`, `STAT-STAT`",
    },
    {
      name: 'hp',
      type: 3,
      description: "Base HP, supports `<STAT`, `>STAT`, `STAT-STAT`",
    },
    {
      name: 'atk',
      type: 3,
      description: "Base Attack, supports `<STAT`, `>STAT`, `STAT-STAT`",
    },
    {
      name: 'def',
      type: 3,
      description: "Base Defence, supports `<STAT`, `>STAT`, `STAT-STAT`",
    },
    {
      name: 'spa',
      type: 3,
      description: "Base Special Attack, supports `<STAT`, `>STAT`, `STAT-STAT`",
    },
    {
      name: 'spd',
      type: 3,
      description: "Base Special Defence, supports `<STAT`, `>STAT`, `STAT-STAT`",
    },
    {
      name: 'spe',
      type: 3,
      description: "Base Speed, supports `<STAT`, `>STAT`, `STAT-STAT`",
    },
    {
      name: 'bst',
      type: 3,
      description: "Base Stat Total, supports `<STAT`, `>STAT`, `STAT-STAT`",
    },
    {
      name: 'gen',
      type: 3,
      description: 'The Generation used in calculation',
      choices: gens.names,
    },
    {
      name: 'mode',
      type: 3,
      description: 'Limit search to current generation.',
      choices: [
        {
          name: 'VGC',
          value: 'vgc',
        },
        {
          name: 'Default',
          value: 'default',
        },
      ],
    },
    {
      name: 'sort',
      type: 3,
      description: 'Sort results by the given key (High to Low)',
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
      description: 'Amount of filters that must match. Comma-separated fields count one for each item.',
      min_value: 1,
    },
  ],
};

const process = async function(interaction) {
  const args = getargs(interaction).params;

  const data = gens.data[args.gen ? args.gen : 'gen8natdex'];
  const filters = [];
  const isVgc = args.mode === 'vgc';

  if(args.abilities) {
    const abilities = args.abilities.split(',');
    for(const ability of abilities) {
      try {
        const filter = filterFactory['ability'](data, ability, isVgc);
        filters.push(filter);
      } catch {
        return {
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [buildEmbed({
              title: "Error",
              description: `The ability ${ability} could not be found in the given generation.`,
              color: 0xCC0000,
            })],
            flags: InteractionResponseFlags.EPHEMERAL,
          },
        };
      }
    }
  }

  if(args.types) {
    const types = args.types.split(',');
    for(const type of types) {
      try {
        const filter = filterFactory['type'](data, type.trimStart(), isVgc);
        filters.push(filter);
      } catch {
        return {
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [buildEmbed({
              title: "Error",
              description: `The type ${type} could not be found in the given generation.`,
              color: 0xCC0000,
            })],
            flags: InteractionResponseFlags.EPHEMERAL,
          },
        };
      }
    }
  }

  if(args.moves) {
    const moves = args.moves.split(',');
    for(const move of moves) {
      try {
        const filter = filterFactory['move'](data, move, isVgc);
        filters.push(filter);
      } catch {
        return {
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [buildEmbed({
              title: "Error",
              description: `The move ${move} could not be found in the given generation.`,
              color: 0xCC0000,
            })],
            flags: InteractionResponseFlags.EPHEMERAL,
          },
        };
      }
    }
  }

  for (const stat of ['hp','atk','def','spa','spd','spe','bst']) {
    if(args[stat]) {
      try {
        const filter = filterFactory[stat](data, args[stat], isVgc);
        filters.push(filter);
      } catch(e) {
        return {
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [buildEmbed({
              title: "Error",
              description: `The query ${args[stat]} is not valid for the '${stat}' argument.`,
              color: 0xCC0000,
            })],
            flags: InteractionResponseFlags.EPHEMERAL,
          },
        };
      }
    }
  }

  if(args['weight-kg']) {
    try {
      const filter = filterFactory['weightkg'](data, args['weight-kg'], isVgc);
      filters.push(filter);
    } catch(e) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: [buildEmbed({
            title: "Error",
            description: `The query ${args['weight-kg']} is not valid for the 'weight-kg' argument.`,
            color: 0xCC0000,
          })],
          flags: InteractionResponseFlags.EPHEMERAL,
        },
      };
    }
  }

  if(args['height-m']) {
    try {
      const filter = filterFactory['heightm'](data, args['height-m'], isVgc);
      filters.push(filter);
    } catch(e) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: [buildEmbed({
            title: "Error",
            description: `The query ${args['height-m']} is not valid for the 'height-m' argument.`,
            color: 0xCC0000,
          })],
          flags: InteractionResponseFlags.EPHEMERAL,
        },
      };
    }
  }

  if(args.weaknesses) {
    const types = args.weaknesses.split(',');
    for(const type of types) {
      try {
        const filter = filterFactory['weakness'](data, type, isVgc);
        filters.push(filter);
      } catch {
        return {
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [buildEmbed({
              title: "Error",
              description: `The type ${type} could not be found in the given generation.`,
              color: 0xCC0000,
            })],
            flags: InteractionResponseFlags.EPHEMERAL,
          },
        };
      }
    }
  }

  if(args.resists) {
    const types = args.resists.split(',');
    for(const type of types) {
      try {
        const filter = filterFactory['resist'](data, type, isVgc);
        filters.push(filter);
      } catch {
        return {
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [buildEmbed({
              title: "Error",
              description: `The type ${type} could not be found in the given generation.`,
              color: 0xCC0000,
            })],
            flags: InteractionResponseFlags.EPHEMERAL,
          },
        };
      }
    }
  }

  if(args['egg-group']) {
    filters.push(filterFactory['egggroup'](data, args['egg-group'], isVgc));
  }

  if(args.evolves !== undefined) {
    filters.push(filterFactory['evolves'](data, args['evolves'], isVgc));
  }
  
  if(args['has-evolved'] !== undefined) {
    filters.push(filterFactory['hasevolved'](data, args['has-evolved'], isVgc));
  }

  if(filters.length === 0) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [buildEmbed({
          title: "Error",
          description: "You haven't added any filters.",
          color: 0xCC0000,
        })],
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    };
  }

  const threshold = args.threshold ?? filters.length;

  const sortKey = args['sort'] ?? 'nil';
  const results = (await applyFilters(toArray(data.species), filters, threshold)).sort((lhs, rhs) => {
    if(sortKey === 'nil') {
      return 0;
    }
    if(sortKey === 'bst') {
      let lhsTotal = 0;
      let rhsTotal = 0;
      ['hp','atk','def','spa','spd','spe'].forEach(el => {
        lhsTotal += lhs.baseStats[el];
        rhsTotal += rhs.baseStats[el];
      });
      return rhsTotal - lhsTotal;
    }
    return rhs.baseStats[sortKey] - lhs.baseStats[sortKey];
  });

  const pages = paginate(results.map((el)=>{return el.name}), 1000);
  const fields = [
    {
      name: 'Filters',
      value: filters.map(el=>`- ${el['description']}`).join('\n'),
    },
    {
      name: `Results (${results.length})`,
      value: pages[0].length ? pages[0] : 'No results found.',
    },
    {
      name: 'Generation',
      value: args.gen ?? 'All Gens',
      inline: true,
    },
    {
      name: 'Transferred Pokémon',
      value: args.mode === 'vgc' ? 'Excluded' : 'Included',
      inline: true,
    },
  ];
  if(threshold !== filters.length) {
    fields.push({
      name: 'Threshold',
      value: `At least ${threshold} filter${threshold === 1 ? '' : 's'} must match`,
      inline: true,
    });
  }
  if(sortKey !== 'nil') {
    const names= {
      'hp': 'Hit Points',
      'atk': 'Attack',
      'def': 'Defence',
      'spa': 'Special Attack',
      'spd': 'Special Defence',
      'spe': 'Speed',
      'bst': 'Base Stat Total',
    };
    fields.push({
      name: 'Sorted by (High to Low)',
      value: names[sortKey],
      inline: true,
    });
  }
  if(pages.length > 1) {
    fields.push({
      name: 'Page',
      value: `1 of ${pages.length}`,
    });
  }

  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      embeds: [buildEmbed({
        fields: fields,
      })],
      components: (pages.length === 1 ? undefined : [
        {
          type: 1,
          components: [
            {
              type: 2,
              custom_id: '-',
              disabled: true,
              style: 2,
              label: 'Previous',
            },
            {
              type: 2,
              custom_id:`_p2_${args.gen ?? 'NaN'}_${threshold}_${args.mode === 'vgc' ?'V':''}_${sortKey}${packFilters(filters)}`,
              style: 2,
              label: 'Next',
            },
          ],
        }
      ]),
    },
  };
};

function autocomplete(interaction) {
  const {params: args, focused} = getargs(interaction);

  const autoArg = args[focused];
  const completers = {
    'abilities': completeAbility,
    'types': completeFilterType,
    'moves': completeMove,
    'weaknesses': completeType,
    'resists': completeType,
  };
  const searches = {
    'abilities': 'abilities',
    'types': 'types',
    'moves': 'moves',
    'weaknesses': 'types',
    'resists': 'types',
  };

  const items = autoArg.split(',')
    .map(e => {
      const negate = e.startsWith('!') ? '!' : '';
      return `${negate}${Data.toID(e)}`
    });
  const current = items.pop();
  const resolved = items.map((e) => {
    const item = gens.data['gen8natdex'][searches[focused]].get(e);
    if(!item) {
      return null;
    }
    const negated = e.startsWith('!') ? '!' : '';
    return {
      id: `${negated}${item.id}`,
      name: `${negated}${item.name}`,
    };
  });

  if(resolved.some(e=>!e)) {
    return {
      type: InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
      data: {
        choices: [],
      },
    };
  }

  const prefix = resolved.reduce((acc,cur) => {
    return {
      name: `${acc.name}${cur.name}, `,
      value: `${acc.value}${cur.id},`,
    };
  }, {name:'',value:''});

  return {
    type: InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
    data: {
      choices: completers[focused](current)
      .map(e=>{
        return {
          name: `${prefix.name}${e.name}`,
          value: `${prefix.value}${e.value}`,
        };
      }),
    },
  };
}

module.exports = {command, process, autocomplete};

