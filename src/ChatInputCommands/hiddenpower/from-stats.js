'use strict';

const Dex = require('@pkmn/dex');
const Data = require('@pkmn/data');

const { getarg } = require('discord-getarg');

const command = {
  description: 'Returns the Hidden Power produced by the given IVs.',
  options: [
    {
      name: 'hp',
      type: 4,
      description: 'The Pokemon\'s HP IV, between 0 and 31.',
      required: true,
    },
    {
      name: 'atk',
      type: 4,
      description: 'The Pokemon\'s Attack IV, between 0 and 31.',
      required: true,
    },
    {
      name: 'def',
      type: 4,
      description: 'The Pokemon\'s Defence IV, between 0 and 31.',
      required: true,
    },
    {
      name: 'spa',
      type: 4,
      description: 'The Pokemon\'s Special Attack IV, between 0 and 31.',
      required: true,
    },
    {
      name: 'spd',
      type: 4,
      description: 'The Pokemon\'s Special Defence IV, between 0 and 31.',
      required: true,
    },
    {
      name: 'spe',
      type: 4,
      description: 'The Pokemon\'s Speed IV, between 0 and 31.',
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
  const generation = getarg(req.body, 'gen')?.value ?? 7;

  if(generation === 1) {
    res.json({
      type: 4,
      data: {
        content: `Hidden power does not exist in Generation ${generation}.`,
        flags: 1 << 6,
      },
    });
    return;
  }

  const types = new Data.Generations(Dex.Dex).get(generation).types;

  const ivs = {
    hp: getarg(req.body, 'hp').value,
    atk: getarg(req.body, 'atk').value,
    def: getarg(req.body, 'def').value,
    spa: getarg(req.body, 'spa').value,
    spd: getarg(req.body, 'spd').value,
    spe: getarg(req.body, 'spe').value,
  }

  const problems = [];

  ['hp', 'atk', 'def', 'spa', 'spd', 'spe'].forEach((el) => {
    if(ivs[el] < 0 || ivs[el] > 31) {
      problems.push(el);
    }
  });

  if(problems.length > 0) {
    res.json({
      type: 4,
      data: {
        contenet: `IVs are restricted between 0 and 31.\nThe following IVs are out of range:\n - ${problems.join('\n - ')}`,
      },
    });
    return;
  }

  const result = types.getHiddenPower(ivs);

  res.json({
    type: 4,
    data: {
      content: `Type: ${result['type']}; Power: ${result['power']}`,
    },
  });
}

module.exports = {command, process}

