'use strict';

const { InteractionResponseFlags, InteractionResponseType } = require('discord-interactions');
const Data = require('@pkmn/data');

const getargs = require('discord-getarg');
const buildEmbed = require('embed-builder');
const gens = require('gen-db');
const colours = require('pkmn-colours');
const { completePokemon } = require('pkmn-complete');
const damageTaken = require('typecheck');

const command = {
  description: 'Returns the given Pokémon\'s weaknesses and resistances.',
  options: [
    {
      name: 'pokemon',
      type: 3,
      description: 'Pokemon to evaluate the STABs of',
      required: true,
      autocomplete: true,
    },
    {
      name: 'gen',
      type: 3,
      description: 'The Generation used in calculation',
      choices: gens.names,
    },
  ],
}

const process = (interaction) => {
  const args = getargs(interaction).params;

  const data = gens.data[args.gen ? args.gen : 'gen8natdex'];

  const pokemon = data.species.get(Data.toID(args.pokemon));

  if(!pokemon?.exists) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [buildEmbed({
          title: "Error",
          description: `Could not find a Pokémon named ${args.pokemon} in the given generation.`,
          color: 0xCC0000,
        })],
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    };
  }

  const title = `${pokemon['name']} [${pokemon['types'].join('/')}]`;
  let description = '';

  const eff = {
    '0x': [],
    '0.25x': [],
    '0.5x': [],
    '1x': [],
    '2x': [],
    '4x': [],
  };

  for(const i of data.types) {
    eff[`${damageTaken(data, pokemon.types, i.id)}x`].push(i.name);
  }

  for(const i of ['0x', '0.25x', '0.5x', '1x', '2x', '4x']) {
    if(eff[i].length === 0) { continue; }
    description += `\n${i}: ${eff[i].join(', ')}`;
  }

  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      embeds: [buildEmbed({
        title,
        description,
        color: colours.types[Data.toID(pokemon.types[0])]
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

module.exports = {command, process, autocomplete};
