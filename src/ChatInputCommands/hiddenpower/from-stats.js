'use strict';

const Dex = require('@pkmn/dex');
const Data = require('@pkmn/data');

const { getargs } = require('discord-getarg');

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
  const args = getargs(req.body).params;
  args.gen ??= 7;

  if(args.gen === 1) {
    res.json({
      type: 4,
      data: {
        embeds: [{
          title: "Error",
          description: `Hidden power does not exist in Generation ${args.gen}.`,
          color: 0xCC0000,
          footer: {
            text: `SableyeBot version 4.0.0-alpha`,
            icon_url: 'https://cdn.discordapp.com/avatars/211522070620667905/6b037c17fc6671f0a5dc73803a4c3338.webp',
          },
        }],
        flags: 1 << 6,
      },
    });
    return;
  }

  const types = new Data.Generations(Dex.Dex).get(args.gen).types;

  const problems = [];

  ['hp', 'atk', 'def', 'spa', 'spd', 'spe'].forEach((el) => {
    if(args[el] < 0 || args[el] > 31) {
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

  const result = types.getHiddenPower(args);

  res.json({
    type: 4,
    data: {
      embeds: [{
        description: `Type: ${result['type']}; Power: ${result['power']}`,
        color: 0x5F32AB,
        footer: {
          text: `SableyeBot version 4.0.0-alpha`,
          icon_url: 'https://cdn.discordapp.com/avatars/211522070620667905/6b037c17fc6671f0a5dc73803a4c3338.webp',
        },
      }],
    },
  });
}

module.exports = {command, process}

