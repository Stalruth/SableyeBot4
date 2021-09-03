'use strict';

const Dex = require('@pkmn/dex');
const Data = require('@pkmn/data');

const dataSearch = require('datasearch');
const getarg = require('discord-getarg');
const { damageTaken } = require('typecheck');

const command = {
  description: 'Returns the resistances and weaknesses of a Pokémon with the given types.',
  options: [
    {
      name: 'types',
      type: 3,
      description: 'Comma separated list of types to check the combined coverage of.',
      required: true,
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

const process = (req, res) => {
  const types_arg = getarg(req.body, 'types').value.split(',');

  const gen = getarg(req.body, 'gen')?.value ?? Dex.Dex.gen;

  const data = new Data.Generations(Dex.Dex).get(gen);

  const types = types_arg.map((el) => {
    return dataSearch(data.types, Data.toID(el))?.result?.name;
  });

  if(types.some((el) => {return !el;})) {
    nonTypes = [];
    for(const i in types) {
      if(!types[i]) {
        nonTypes.push(types_arg[i]);
      }
    }

    res.json({
      type: 4,
      data: {
        content: `Could not find Types named ${nonTypes.join(',')} in Generation ${gen}.`,
      },
    });
    return;
  }

  let reply = `[${types.join('/')}]`;

  const eff = {
    '0x': [],
    '0.25x': [],
    '0.5x': [],
    '1x': [],
    '2x': [],
    '4x': [],
  };

  for(const i of data.types) {
    eff[`${damageTaken(data, types, i.id)}x`].push(i.name);
  }

  for(const i of ['0x', '0.25x', '0.5x', '1x', '2x', '4x']) {
    if(eff[i].length === 0) { continue; }
    reply += `\n${i}: ${eff[i].join(', ')}`;
  }

  res.json({
    type: 4,
    data: {
      content: reply,
    },
  });
}

module.exports = {command, process}

