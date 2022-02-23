'use strict';

const { InteractionResponseFlags, InteractionResponseType } = require('discord-interactions');
const Data = require('@pkmn/data');

const getargs = require('discord-getarg');
const { buildEmbed, buildError } = require('embed-builder');
const gens = require('gen-db');
const colours = require('pkmn-colours');
const { completePokemon, completeType, getMultiComplete } = require('pkmn-complete');
const damageTaken = require('typecheck');

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
      description: 'Types to check. (Comma-delimited list)',
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

  const data = gens.data[args.gen ? args.gen : 'natdex'];

  if(!args.pokemon && !args.types) {
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

  const titleInfo = {
    pokemon: false,
    types: [],
  };

  const types = []

  if(args.pokemon) {
    const pokemon = data.species.get(Data.toID(args.pokemon));

    if(!pokemon?.exists) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: [
            buildError(`Pokémon ${args.pokemon} does not exist in the given generation.`),
          ],
          flags: InteractionResponseFlags.EPHEMERAL,
        },
      };
    }

    titleInfo.pokemon = {
      name: pokemon.name,
      types: pokemon.types,
    };

    pokemon.types.forEach((el) => {types.push(el)});
  }

  if(args.types) {
    const sanitisedTypes = args.types
        .split(',')
        .map(el=>data.types.get(Data.toID(el))?.name);

    if(sanitisedTypes.some(el=>!el)) {
      const nonTypes = sanitisedTypes.map((el,a,i) => {
        if(el) { return undefined; }
        return args.types.split(',')[i];
      }).filter(el=>!!el);

      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: [
            buildError(`The type${nonTypes.length > 1 ? 's' : ''} ${nonTypes.join(', ')} do not exist in the given generation.`)
          ],
          flags: InteractionResponseFlags.EPHEMERAL,
        },
      };
    }

    titleInfo.types = [...new Set(sanitisedTypes)];
    types.push(...titleInfo.types);
  }

  const titleSegments = [
    titleInfo.pokemon ? `${titleInfo.pokemon.name} [${titleInfo.pokemon.types.join('/')}] ` : '',
    titleInfo.types.join(', ')
  ].filter(e=>e.length>0);

  const title = titleSegments.join(' + ');

  const eff = {
    '0': [],
    '0.5': [],
    '1': [],
    '2': [],
  };

  for(const dType of data.types) {
    const mult = types.reduce((acc, aType) => {
      return Math.max(acc, damageTaken(data, [dType.id], aType));
    }, 0);
    eff[`${mult}`].push(dType.name);
  }

  const fields = [];
  const names = {
    '0': 'Cannot Hit',
    '0.5': 'Hits for 0.5x',
    '1': 'Hits for 1x',
    '2': 'Hits for 2x',
  };

  for(const i of ['0', '0.5', '1', '2']) {
    if(eff[i].length === 0) { continue; }
    fields.push({
      name: `${names[i]}:`,
      value: eff[i].join(', '),
    });
  }

  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      embeds: [buildEmbed({
        title,
        fields,
        color: colours.types[Data.toID(types[0])]
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

