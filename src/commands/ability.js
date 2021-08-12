'use strict';

const Dex = require('@pkmn/dex');
const Data = require('@pkmn/data');

const dataSearch = require('datasearch');

const command = {
  description: 'Return information on the given ability.',
  options: [
    {
      name: 'name',
      type: 'STRING',
      description: 'Name of the Ability',
      required: true,
    },
    {
      name: 'gen',
      type: 'INTEGER',
      description: 'The Generation used for lookup.',
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
};

const process = async function(interaction) {
  const name = interaction.options.getString('name');
  const gen = interaction.options.getInteger('gen') ?? Dex.Dex.gen;

  const data = new Data.Generations(Dex.Dex).get(gen);

  const ability = dataSearch(data.abilities, Data.toID(name))?.result;

  if(!ability) {
    await interaction.editReply(`Could not find an ability named ${name} in Generation ${gen}.`);
    return;
  }

  await interaction.editReply(`${ability['name']}\n${ability['desc']}`);
};

module.exports = {command, process};

