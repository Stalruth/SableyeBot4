'use strict';

const Dex = require('@pkmn/dex');
const Data = require('@pkmn/data');
const dataSearch = require('datasearch');

const { damageTaken } = require('typecheck');

const command = {
  description: 'Returns the resistances and weaknesses of a Pokémon with the given types.',
  options: [
    {
      name: 'types',
      type: 'STRING',
      description: 'Comma separated list of types to check the combined coverage of.',
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

const process = async (interaction) => {
  const types_arg = interaction.options.getString('types').split(',');

  const gen = interaction.options.getInteger('gen') ?? Dex.Dex.gen;

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

    await interaction.editReply(`Could not find Types named ${nonTypes.join(',')} in Generation ${gen}.`);
    return;
  }

  let reply = `[${types.join('/')}]`;

  const eff = damageTaken(types, data);

  for(const i of eff) {
    reply += `\n${i['label']}: ${i['types'].join(', ')}`;
  }

  await interaction.editReply(reply);
}

module.exports = {command, process}

