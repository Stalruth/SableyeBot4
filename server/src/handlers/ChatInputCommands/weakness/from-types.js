'use strict';

const { InteractionResponseFlags, InteractionResponseType } = require('discord-interactions');
const Data = require('@pkmn/data');
const Sim = require('@pkmn/sim');

const getargs = require('discord-getarg');
const { buildEmbed, buildError } = require('embed-builder');
const gens = require('gen-db');
const colours = require('pokemon-colours');
const { completeType, getMultiComplete } = require('pokemon-complete');
const damageTaken = require('typecheck');

const definition = {
  description: 'Returns the resistances and weaknesses of a Pokémon with the given types.',
  options: [
    {
      name: 'types',
      type: 3,
      description: 'Types to check the weaknesses of, separated by commas. (maximum 3)',
      required: true,
      autocomplete: true,
    },
    {
      name: 'gen',
      type: 3,
      description: 'The Generation used to calculate against.',
      choices: gens.names,
    },
  ],
}

const process = (interaction) => {
  const args = getargs(interaction).params;

  const data = gens.data[args.gen ? args.gen : 'natdex'];

  const types = [...new Set(args.types
      .split(',')
      .slice(0,3)
      .map((el) => {
        return data.types.get(Data.toID(el))?.name;
      }))]

  if(types.some((el) => {return !el;})) {
    let nonTypes = [];
    for(const i in types) {
      if(!types[i]) {
        nonTypes.push(args.types.split(',')[i]);
      }
    }

    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [
          buildError(`Could not find Type(s) named ${nonTypes.join(',')} in Generation ${args.gen}.`,)
        ],
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    };
  }

  let title = `- [${types.join('/')}]`;
  let fields = [];

  const eff = {
    0: [],
    0.125: [],
    0.25: [],
    0.5: [],
    1: [],
    2: [],
    4: [],
    8: [],
  };

  for(const i of data.types) {
    eff[i.totalEffectiveness(types)].push(i.name);
  }
  
  const names = {
    0: 'Immune',
    0.125: 'Resists (0.125x)',
    0.25: 'Resists (0.25x)',
    0.5: 'Resists (0.5x)',
    1: 'Neutral damage',
    2: 'Weak (2x)',
    4: 'Weak (4x)',
    8: 'Weak (8x)',
  };

  for(const i of [0, 0.125, 0.25, 0.5, 1, 2, 4, 8]) {
    if(eff[i].length === 0) { continue; }
    fields.push({
      name: names[i],
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
      })]
    },
  };
}

function autocomplete(interaction) {
  const { params } = getargs(interaction);

  return {
      type: InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
      data: {
        choices: getMultiComplete(gens.data['natdex'].types, completeType, false)(params['types']),
      },
    };
}

module.exports = {
  definition,
  command: {
    process,
    autocomplete
  }
};

