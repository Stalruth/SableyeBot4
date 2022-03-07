'use strict';

const { InteractionResponseFlags, InteractionResponseType } = require('discord-interactions');
const Data = require('@pkmn/data');

const getargs = require('discord-getarg');
const { buildEmbed, buildError } = require('embed-builder');
const gens = require('gen-db');
const colours = require('pokemon-colours');
const { completePokemon, completeType, getMultiComplete } = require('pokemon-complete');

const definition = {
  description: 'Returns type coverage based on a Pokémon\'s STAB and/or types.',
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
      name: 'gen',
      type: 3,
      description: 'Generation to check against.',
      choices: gens.names,
    },
  ],
};

function process(interaction) {
  const args = getargs(interaction).params;

  if (!args.pokemon && !args.types) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [
          buildError('Please provide a Pokémon and/or at least one Type.')
        ],
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    };
  }

  const data = gens.data[args.gen ? args.gen : 'natdex'];

  const pokemon = data.species.get(args.pokemon ?? '');

  if (args.pokemon && !pokemon) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [
          buildError(`The Pokémon ${args.pokemon} does not exist in the given generation.`)
        ],
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    };
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
    return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: [
            buildError(`The Type${invalidTypes.length > 1 ? 's' : ''} ${invalidTypes.join(', ')} do${invalidTypes.length > 1 ? '' : 'es'} not exist in the given generation.`),
          ],
          flags: InteractionResponseFlags.EPHEMERAL,
        },
      };
    }
  }

  const allTypes = [
    ...(pokemon?.types?.map(t=>data.types.get(t)) ?? []),
    ...types,
  ];

  const results = {};

  for (const type of data.types) {
    const effectiveness = allTypes.reduce((acc, cur) => {
      return Math.max(acc, cur.totalEffectiveness([type.id]));
    }, 0);
    results[`${effectiveness}`] ??= [];
    results[`${effectiveness}`].push(type.name);
  }

  const titleParts = [];
  if (args.pokemon) {
    titleParts.push(`${pokemon.name} [${pokemon.types.join('/')}]`);
  }
  if (args.types) {
    titleParts.push(types.map(t=>t.name).join(', '));
  }

  const fields = [];
  const fieldNames = {
    '0': 'Does not hit',
    '0.5': 'Hits for 0.5x',
    '1': 'Hits for 1x',
    '2': 'Hits for 2x',
  };
  for (const i of ['0', '0.5', '1', '2']) {
    if (results[i]) {
      fields.push({
        name: fieldNames[i],
        value: results[i].join(', '),
      });
    }
  }

  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      embeds: [buildEmbed({
        title: titleParts.join(' + '),
        fields,
        color: colours.types[allTypes[0].id]
      })],
    },
  };
};

function autocomplete(interaction) {
  const {params, focused} = getargs(interaction);

  if(focused === 'pokemon') {
    return {
      type: InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
      data: {
        choices: completePokemon(params['pokemon']),
      },
    };
  }

  if(focused === 'types') {
    return {
      type: InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
      data: {
        choices: getMultiComplete(gens.data['natdex'].types, completeType, false)(params['types']),
      },
    };
  }

  // should never be hit
  return {
    type: InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
    data: {
      choices: [{
        name: params[params[focused]],
        value: params[params[focused]],
      }]
    },
  };
}

module.exports = {
  definition,
  command: {
    process,
    autocomplete,
  }
};

