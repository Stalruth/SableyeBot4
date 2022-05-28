import { InteractionResponseFlags, InteractionResponseType } from 'discord-interactions';
import fetch from 'node-fetch';

import db from 'db-service';
import getargs from 'discord-getarg';
import { buildEmbed, buildError } from 'embed-builder';
import gens from 'gen-db';
import { completeAbility, completeMove, completeType, completePokemon, getMultiComplete, getAutocompleteHandler } from 'pokemon-complete';
import { filterFactory, applyFilters } from 'pokemon-filters';

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
      description: 'Can breed with the given Pokémon.',
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
      description: 'Has (or does not have) a pre-evolution',
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
      description: 'Takes less than 1x damage from the types given (disregards Abilities), separated by commas.',
      autocomplete: true,
    },
    {
      name: 'types',
      type: 3,
      description: 'Has all of the types given. (Comma-delimited list, prefix a type with `!` to negate)',
      description: 'Has all of the types given, separated by commas and negated with `!`.',
      autocomplete: true,
    },
    {
      name: 'vgc-legality',
      type: 3,
      description: "Is legal in certain VGC formats.",
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
      description: 'Takes more than 1x damage from the types given (disregards Abilities), separated by commas.',
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
      description: 'Include moves learned in older gens. (Enabled by default, exclude for VGC rules)',
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
};

async function validate(interaction) {
  const args = getargs(interaction).params;

  const gen = args.gen ?? 'natdex';
  const data = gens.data[gen];
  const filters = [];
  const isVgc = !(args['transfer-moves'] ?? true);

  if(args.abilities) {
    const abilities = args.abilities.split(',');
    for(const ability of abilities) {
      if(data.abilities.get(ability)?.exists) {
        filters.push({'type':'ability','query':ability});
      } else {
        return {
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [
              buildError(`The ability ${ability} could not be found in the given generation.`)
            ],
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
        filters.push({'type':'type','query':type});
      } else {
        return {
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [
              buildError(`The type ${type} could not be found in the given generation.`)
            ],
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
        filters.push({'type':'move','query':move});
      } else {
        return {
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [
              buildError(`The move ${move} could not be found in the given generation.`)
            ],
            flags: InteractionResponseFlags.EPHEMERAL,
          },
        };
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
        filters.push({'type':stat,'query':args[stat]});
      } else {
        return {
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [
              buildError(`The query ${args[stat]} is not valid for the '${stat}' argument.`)
            ],
            flags: InteractionResponseFlags.EPHEMERAL,
          },
        };
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
        filters.push({'type':stat,'query':args[stat]});
      } else {
        return {
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [
              buildError(`The query ${args[stat]} is not valid for the '${stat}' argument.`)
            ],
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
        filters.push({type:'weakness',query:type});
      } else {
        return {
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [
              buildError(`The type ${type} could not be found in the given generation.`)
            ],
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
        filters.push({type:'resist',query:type});
      } else {
        return {
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [
              buildError(`The type ${type} could not be found in the given generation.`)
            ],
            flags: InteractionResponseFlags.EPHEMERAL,
          }
        };
      }
    }
  }

  if(args['breeds-with']) {
    if(data.species.get(args['breeds-with'])?.exists) {
      filters.push({type:'breeds-with',query:args['breeds-with']});
    } else {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: [
            buildError(`The Pokémon ${args['breeds-with']} could not be found in the given generation.`)
          ],
          flags: InteractionResponseFlags.EPHEMERAL,
        },
      };
    }
  }

  if(args['has-evo'] !== undefined) {
    filters.push({type:'has-evo',query:args['has-evo']});
  }

  if(args['has-prevo'] !== undefined) {
    filters.push({type:'has-prevo',query:args['has-prevo']});
  }

  if(args['vgc-legality'] !== undefined) {
    filters.push({type:'vgc-legality',query:args['vgc-legality']});
  }

  if(filters.length === 0) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [
          buildError("You haven't added any filters.")
        ],
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    };
  }

  const threshold = args.threshold ?? filters.length;

  const sortKey = args['sort'];

  const config = {
    interactionId: interaction.id,
    timestamp: interaction.id / 4194304 + 1420070400000,
    filters,
    parameters: {
      sortKey,
      isVgc,
      gen,
      threshold,
    },
    webhook: {
      token: interaction.token,
      appId: interaction.application_id,
    }
  };

  db.getFilterCollection().insert(config);

  return {
    type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE
  };
}

async function followUp(interaction) {
  const commandData = db.getFilterCollection().findOne({interactionId: interaction.id});
  if(!commandData) { return; }
  const { threshold, gen, isVgc, sortKey } = commandData.parameters;
  const filters = commandData.filters.map(
    e=>filterFactory[e.type](gen, e.query, isVgc)
  );

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
    commandData.pages = pages;
    db.getFilterCollection().update(commandData);
  } else {
    db.getFilterCollection().remove(commandData);
  }

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

  const pageList = pages.length <= 5 ?
    new Array(pages.length)
    .fill(0)
    .map((e,i)=>i+1)
    :
    [...(new Set([
      1,
      Math.min(2, pages.length),
      Math.min(3, pages.length),
      Math.min(4, pages.length),
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

  const response = await fetch(`https://discord.com/api/v10/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`,
    {
      method: 'PATCH',
      body: JSON.stringify(message),
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': `DiscordBot (https://github.com/Stalruth/SableyeBot4, v${process.env.npm_package_version})`,
      },
    }
  );

  if(!response.ok) {
    throw new Error(`${response.status} ${await response.text()}`);
  }
}

const autocomplete = {
  abilities: getAutocompleteHandler(getMultiComplete(natdex.abilities, completeAbility, {canNegate: false, canRepeat: true}), 'abilities'),
  types: getAutocompleteHandler(getMultiComplete(natdex.types, completeType, {canNegate: true, canRepeat: true}), 'types'),
  moves: getAutocompleteHandler(getMultiComplete(natdex.moves, completeMove, {canNegate: true, canRepeat: true}), 'moves'),
  weaknesses: getAutocompleteHandler(getMultiComplete(natdex.types, completeType, {canNegate: false, canRepeat: true}), 'weaknesses'),
  resists: getAutocompleteHandler(getMultiComplete(natdex.types, completeType, {canNegate: false, canRepeat: true}), 'resists'),
  'breeds-with': getAutocompleteHandler(completePokemon, 'breeds-with'),
};

export default {
  definition,
  command: {
    process: validate,
    followUp,
    autocomplete,
  }
};

