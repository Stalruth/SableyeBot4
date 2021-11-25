'use strict';

const { InteractionResponseFlags, InteractionResponseType } = require('discord-interactions');
const Data = require('@pkmn/data');
const Sim = require('@pkmn/sim');

const getargs = require('discord-getarg');
const buildEmbed = require('embed-builder');
const natDexData = require('natdexdata');
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
      type: 4,
      description: 'The Generation used in calculation',
      choices: [
        {
          name: 'RBY',
          value: 1,
        },
        {
          name: 'GSC',
          value: 2,
        },
        {
          name: 'RSE',
          value: 3,
        },
        {
          name: 'DPPt/HGSS',
          value: 4,
        },
        {
          name: 'BW/BW2',
          value: 5,
        },
        {
          name: 'XY/ORAS',
          value: 6,
        },
        {
          name: 'SM/USM',
          value: 7,
        },
        {
          name: 'SwSh',
          value: 8,
        },
      ]
    },
  ],
}

const process = (interaction) => {
  const args = getargs(interaction).params;

  const data = args.gen ? new Data.Generations(Sim.Dex).get(args.gen) : natDexData;

  const pokemon = data.species.get(Data.toID(args.pokemon));

  if(!pokemon?.exists) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [buildEmbed({
          title: "Error",
          description: `Could not find a Pokémon named ${args.pokemon}${args.gen ? ` in Generation ${args.gen}` : ''}.`,
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

