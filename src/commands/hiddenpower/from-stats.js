'use strict';

const Dex = require('@pkmn/dex');
const Data = require('@pkmn/data');

const command = {
  description: 'Returns the Hidden Power produced by the given IVs.',
  options: [
    {
      name: 'hp',
      type: 'INTEGER',
      description: 'The Pokemon\'s HP IV, between 0 and 31.',
      required: true,
    },
    {
      name: 'atk',
      type: 'INTEGER',
      description: 'The Pokemon\'s Attack IV, between 0 and 31.',
      required: true,
    },
    {
      name: 'def',
      type: 'INTEGER',
      description: 'The Pokemon\'s Defence IV, between 0 and 31.',
      required: true,
    },
    {
      name: 'spa',
      type: 'INTEGER',
      description: 'The Pokemon\'s Special Attack IV, between 0 and 31.',
      required: true,
    },
    {
      name: 'spd',
      type: 'INTEGER',
      description: 'The Pokemon\'s Special Defence IV, between 0 and 31.',
      required: true,
    },
    {
      name: 'spe',
      type: 'INTEGER',
      description: 'The Pokemon\'s Speed IV, between 0 and 31.',
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

const process = async (client, interaction) => {
  await interaction.defer();
  const generation = interaction.options.getInteger('gen') ?? 7;

  if(generation === 1) {
    await interaction.editReply(`Hidden power does not exist in Generation ${generation}.`);
    return;
  }

  const types = new Data.Generations(Dex.Dex).get(generation).types;

  const ivs = {
    hp: interaction.options.getInteger('hp'),
    atk: interaction.options.getInteger('atk'),
    def: interaction.options.getInteger('def'),
    spa: interaction.options.getInteger('spa'),
    spd: interaction.options.getInteger('spd'),
    spe: interaction.options.getInteger('spe'),
  }

  const problems = [];

  ['hp', 'atk', 'def', 'spa', 'spd', 'spe'].forEach((el) => {
    if(ivs[el] < 0 || ivs[el] > 31) {
      problems.push(el);
    }
  });

  if(problems.length > 0) {
    await interaction.editReply(`IVs are restricted between 0 and 31.\nThe following IVs are out of range:\n - ${problems.join('\n - ')}`);
    return;
  }

  const result = types.getHiddenPower(ivs);

  await interaction.editReply(`Type: ${result['type']}; Power: ${result['power']}`);
}

module.exports = {command, process}

