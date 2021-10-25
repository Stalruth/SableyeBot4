'use strict';

const Data = require('@pkmn/data');
const Dex = require('@pkmn/dex');

const dataSearch = require('datasearch');
const getargs = require('discord-getarg');
const buildEmbed = require('embed-builder');
const natDexData = require('natdexdata');
const colours = require('pkmn-colours');
const { completePokemon } = require('pkmn-complete');
const damageTaken = require('typecheck');

const command = {
  description: 'Returns the offensive coverage of a Pokémon\'s moves.',
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

  const data = args.gen ? new Data.Generations(Dex.Dex).get(args.gen) : natDexData;

  const pokemon = dataSearch(data.species, Data.toID(args.pokemon))?.result;

  if(!pokemon) {
    return {
      type: 4,
      data: {
        embeds: [buildEmbed({
          title: "Error",
          description: `Could not find a Pokémon named ${args.pokemon}${args.gen ? ` in Generation ${args.gen}` : ''}.`,
          color: 0xCC0000,
        })],
        flags: 1 << 6,
      },
    };
  }

  const title = `${pokemon['name']} [${pokemon['types'].join('/')}]`;
  let description = '';

  const eff = {
    '0': [],
    '0.5': [],
    '1': [],
    '2': [],
  };

  for(const dType of data.types) {
    const mult = pokemon.types.reduce((acc, aType) => {
      return Math.max(acc, damageTaken(data, [dType.id], aType));
    }, 0);
    eff[`${mult}`].push(dType.name);
  }

  for(const i of ['0', '0.5', '1', '2']) {
    if(eff[i].length === 0) { continue; }
    description += `\n${i}x: ${eff[i].join(', ')}`;
  }

  return {
    type: 4,
    data: {
      embeds: [buildEmbed({
        title,
        description,
        color: colours.types[Data.toID(pokemon.types[0])]
      })],
    },
  };
};

function autocomplete(interaction) {
  const args = getargs(interaction).params;
  return {
    type: 8,
    data: {
      choices: completePokemon(args['pokemon']),
    },
  };
}

module.exports = {command, process, autocomplete};

