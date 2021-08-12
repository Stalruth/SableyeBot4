'use strict';

const Dex = require('@pkmn/dex');
const Data = require('@pkmn/data');
const dataSearch = require('datasearch');

const { coverage } = require('typecheck');

const command = {
  description: 'Returns the offensive coverage of a Pokémon\'s moves.',
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

const process = async (interaction) => {
  const name = interaction.options.getString('pokemon');
  const gen = interaction.options.getInteger('gen') ?? Dex.Dex.gen;

  const data = new Data.Generations(Dex.Dex).get(gen);

  const pokemon = dataSearch(data.species, Data.toID(name))?.result;

  if(!pokemon) {
    await interaction.editReply(`Could not find a Pokémon named ${name} in Generation ${gen}.`);
    return;
  }

  let reply = `${pokemon['name']} [${pokemon['types'].join('/')}]`;

  const eff = coverage(pokemon['types'], data);

  for(const i of eff) {
    reply += `\n${i['label']}: ${i['types'].join(', ')}`;
  }

  await interaction.editReply(reply);
}

module.exports = {command, process}

