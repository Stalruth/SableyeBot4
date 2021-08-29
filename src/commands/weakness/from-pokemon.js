'use strict';

const Dex = require('@pkmn/dex');
const Data = require('@pkmn/data');
const dataSearch = require('datasearch');

const { damageTaken } = require('typecheck');
const getarg = require('discord-getarg');

const command = {
  description: 'Returns the given Pokémon\'s weaknesses and resistances.',
  options: [
    {
      name: 'pokemon',
      type: 'STRING',
      description: 'Pokemon to evaluate the STABs of',
      required: true,
    },
    {
      name: 'gen',
      type: 'INTEGER',
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

const process = (req, res) => {
  const name = getarg(req.body, 'pokemon').value;
  const gen = getarg(req.body, 'gen')?.value ?? Dex.Dex.gen;

  const data = new Data.Generations(Dex.Dex).get(gen);

  const pokemon = dataSearch(data.species, Data.toID(name))?.result;

  if(!pokemon) {
    res.json({
      type: 4,
      data: {
        content: `Could not find a Pokémon named ${name} in Generation ${gen}.`,
      },
    });
    return;
  }

  let reply = `${pokemon['name']} [${pokemon['types'].join('/')}]`;

  const eff = damageTaken(pokemon['types'], data);

  for(const i of eff) {
    reply += `\n${i['label']}: ${i['types'].join(', ')}`;
  }

  res.json({
    type: 4,
    data: {
      content: reply
    },
  });
}

module.exports = {command, process}

