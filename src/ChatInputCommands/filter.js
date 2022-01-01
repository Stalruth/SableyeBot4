'use strict';

const { InteractionResponseFlags, InteractionResponseType } = require('discord-interactions');

const getargs = require('discord-getarg');
const gens = require('gen-db');

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

  const args = getargs(interaction).params;

  const data = gens.data[args.gen ? args.gen : 'gen8natdex'];
  const filters = [];
  const isVgc = args.mode === 'vgc';

  if(args.abilities) {
    const abilities = args.abilities.split(',');
    for(const ability of abilities) {
      if(data.abilities.get(ability)?.exists) {
        filters.push({filter: 'ability', query: ability});
      } else {
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
      if(data.types.get(type)?.exists) {
        filters.push({filter: 'type', query: type});
      } else {
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
      if(data.moves.get(move)?.exists) {
        filters.push({filter: 'move', query: move});
      } else {
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

  for (const stat of ['hp','atk','def','spa','spd','spe','bst','weight-kg','height-m']) {
    if(args[stat]) {
      if(args[stat].match(/^([<>]?\d+|\d+-\d+)$/)) {
        filters.push({filter: stat, query: args[stat]});
      } else {
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

  if(args.weaknesses) {
    const types = args.weaknesses.split(',');
    for(const type of types) {
      if(data.types.get(type)?.exists) {
        filters.push({filter: 'weakness', query: type});
      } else {
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
      if(data.types.get(type)?.exists) {
        filters.push({filter: 'resist', query: type});
      } else {
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
    filters.push({filter: 'egg-group', query: args['egg-group']});
  }

  if(args.evolves !== undefined) {
    filters.push({filter: 'evolves', query: args['evolves'] ? 't' : 'f'});
  }

  if(args['has-evolved'] !== undefined) {
    filters.push({filter: 'has-evolved', query: args['has-evolved'] ? 't' : 'f'});
  }

  if(args['vgc-legality'] !== undefined) {
    filters.push({filter: 'vgc-legality', query: args['vgc-legality']});
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

  const sortKey = args['sort'];

  const config = {
    params: {
      filters,
      isVgc: isVgc,
      gen: args.gen ?? 'gen8natdex',
      threshold,
    },
    info: {
      token: interaction.token,
      appId: interaction.application_id,
      timestamp: interaction.id / 4194304 + 1420070400000,
    }
  };

  if(sortKey) {
    config.params.sort = sortKey;
  }

  const ref = admin.database().ref(`/filters/${interaction.id}`);
  ref.set(config);

  return {
    type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
  };
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

module.exports = {command, process, autocomplete};

