'use strict';

const { InteractionResponseFlags, InteractionResponseType } = require('discord-interactions');

const getargs = require('discord-getarg');
const gens = require('gen-db');

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
      name: 'vgc-legality',
      type: 3,
      description: "Legendary status of a Pokémon",
      choices: [
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
        }
      ],
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
  const admin = require('init-admin');
  const buildEmbed = require('embed-builder');
  const { filterFactory, applyFilters } = require('pokemon-filters');

  const args = getargs(interaction).params;

  const data = gens.data[args.gen ? args.gen : 'gen8natdex'];
  const filters = [];
  const gen = args.gen ?? 'gen8natdex';
  const isVgc = args.mode === 'vgc';

  if(args.abilities) {
    const abilities = args.abilities.split(',');
    for(const ability of abilities) {
      if(data.abilities.get(ability)?.exists) {
        filters.push(filterFactory['ability'](gen, ability, isVgc));
      } else {
        return {
          embeds: [buildEmbed({
            title: "Error",
            description: `The ability ${ability} could not be found in the given generation.`,
            color: 0xCC0000,
          })],
          flags: InteractionResponseFlags.EPHEMERAL,
        };
      }
    }
  }

  if(args.types) {
    const types = args.types.split(',');
    for(const type of types) {
      if(data.types.get(type)?.exists) {
        filters.push(filterFactory['type'](gen, type, isVgc));
      } else {
        return {
          embeds: [buildEmbed({
            title: "Error",
            description: `The type ${type} could not be found in the given generation.`,
            color: 0xCC0000,
          })],
          flags: InteractionResponseFlags.EPHEMERAL,
        };
      }
    }
  }

  if(args.moves) {
    const moves = args.moves.split(',');
    for(const move of moves) {
      if(data.moves.get(move)?.exists) {
        filters.push(filterFactory['move'](gen, move, isVgc));
      } else {
        return {
          embeds: [buildEmbed({
            title: "Error",
            description: `The move ${move} could not be found in the given generation.`,
            color: 0xCC0000,
          })],
          flags: InteractionResponseFlags.EPHEMERAL,
        };
      }
    }
  }

  for (const stat of ['hp','atk','def','spa','spd','spe','bst','weight-kg','height-m']) {
    if(args[stat]) {
      if(args[stat].match(/^([<>]?\d+|\d+-\d+)$/) !== null) {
        filters.push(filterFactory[stat](gen, args[stat], isVgc));
      } else {
        return {
          embeds: [buildEmbed({
            title: "Error",
            description: `The query ${args[stat]} is not valid for the '${stat}' argument.`,
            color: 0xCC0000,
          })],
          flags: InteractionResponseFlags.EPHEMERAL,
        };
      }
    }
  }

  if(args.weaknesses) {
    const types = args.weaknesses.split(',');
    for(const type of types) {
      if(data.types.get(type)?.exists) {
        filters.push(filterFactory['weakness'](gen, type, isVgc));
      } else {
        return {
          embeds: [buildEmbed({
            title: "Error",
            description: `The type ${type} could not be found in the given generation.`,
            color: 0xCC0000,
          })],
          flags: InteractionResponseFlags.EPHEMERAL,
        };
      }
    }
  }

  if(args.resists) {
    const types = args.resists.split(',');
    for(const type of types) {
      if(data.types.get(type)?.exists) {
        filters.push(filterFactory['resist'](gen, type, isVgc));
      } else {
        return {
          embeds: [buildEmbed({
            title: "Error",
            description: `The type ${type} could not be found in the given generation.`,
            color: 0xCC0000,
          })],
          flags: InteractionResponseFlags.EPHEMERAL,
        };
      }
    }
  }

  if(args['egg-group']) {
    filters.push(filterFactory['egg-group'](gen, args['egg-group'], isVgc));
  }

  if(args.evolves !== undefined) {
    filters.push(filterFactory['evolves'](gen, args['evolves'], isVgc));
  }

  if(args['has-evolved'] !== undefined) {
    filters.push(filterFactory['has-evolved'](gen, args['has-evolved'], isVgc));
  }

  if(args['vgc-legality'] !== undefined) {
    filters.push(filterFactory['vgc-legality'](gen, args['vgc-legality'], isVgc));
  }

  if(filters.length === 0) {
    return {
      embeds: [buildEmbed({
        title: "Error",
        description: "You haven't added any filters.",
        color: 0xCC0000,
      })],
      flags: InteractionResponseFlags.EPHEMERAL,
    };
  }

  const threshold = args.threshold ?? filters.length;

  const sortKey = args['sort'];

  const config = {
    info: {
      token: interaction.token,
      appId: interaction.application_id,
      timestamp: interaction.id / 4194304 + 1420070400000,
    }
  };

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
      value: gen,
      inline: true,
    },
    {
      name: 'Transferred Pokémon',
      value: isVgc ? 'Excluded' : 'Included',
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

  if(sortKey) {
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

  const pageList = [...(new Set([
    1,
    Math.min(2, pages.length),
    pages.length
  ]))];

  const message = {
    embeds: [buildEmbed({
      fields: fields,
    })],
    components: (pages.length === 1 ? undefined : [
      {
        type: 1,
        components: pageList.map(page => ({
          type: 2,
          custom_id: page === 1 ? '-' : `${page}`,
          disabled: page === 1,
          style: 2,
          label: `Page ${page}`,
        }))
      }
    ]),
  };

  config.pages = pages;

  if(pages.length > 1) {
    const ref = admin.database().ref(`/filters/${interaction.id}`);
    await ref.set(config);
  }

  return message;
};

function autocomplete(interaction) {
  const { completeAbility, completeFilterType, completeMove, completeType } = require('pkmn-complete');

  const {params, focused} = getargs(interaction);

  const autoArg = params[focused];
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

  const items = autoArg.split(',');
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

module.exports = {command, defer: true, process, autocomplete};

