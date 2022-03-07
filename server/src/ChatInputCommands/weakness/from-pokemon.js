'use strict';

const { InteractionResponseFlags, InteractionResponseType } = require('discord-interactions');

const getargs = require('discord-getarg');
const { buildEmbed, buildError } = require('embed-builder');
const gens = require('gen-db');
const colours = require('pokemon-colours');
const { completePokemon } = require('pokemon-complete');

const definition = {
  description: 'Returns the given Pokémon\'s weaknesses and resistances.',
  options: [
    {
      name: 'pokemon',
      type: 3,
      description: 'Pokemon to check the weaknesses of.',
      required: true,
      autocomplete: true,
    },
    {
      name: 'gen',
      type: 3,
      description: 'The Generation to calculate against.',
      choices: gens.names,
    },
  ],
}

const process = (interaction) => {
  const args = getargs(interaction).params;

  const data = gens.data[args.gen ? args.gen : 'natdex'];

  const pokemon = data.species.get(args.pokemon);

  if(!pokemon?.exists) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [
          buildError(`Could not find a Pokémon named ${args.pokemon} in the given generation.`)
        ],
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    };
  }

  const title = `${pokemon['name']} [${pokemon['types'].join('/')}]`;
  const fields = [];

  const eff = {
    0: [],
    0.25: [],
    0.5: [],
    1: [],
    2: [],
    4: [],
  };

  for(const i of data.types) {
    eff[i.totalEffectiveness(pokemon)].push(i.name);
  }

  const names = {
    0: 'Immune',
    0.25: 'Resists (0.25x)',
    0.5: 'Resists (0.5x)',
    1: 'Neutral damage',
    2: 'Weak (2x)',
    4: 'Weak (4x)',
  };

  for(const i of [0, 0.25, 0.5, 1, 2, 4]) {
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
        color: colours.types[data.types.get(pokemon.types[0]).id]
      })]
    },
  };
}

function autocomplete(interaction) {
  const args = getargs(interaction).params;
  return {
    type: InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
    data: {
      choices: completePokemon(args['pokemon']),
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
