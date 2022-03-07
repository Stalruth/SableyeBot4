'use strict';

const { InteractionResponseFlags, InteractionResponseType } = require('discord-interactions');
const Data = require('@pkmn/data');
const Sim = require('@pkmn/sim');

const getargs = require('discord-getarg');
const { buildEmbed } = require('embed-builder');
const colours = require('pokemon-colours');

const definition = {
  description: 'Returns the Hidden Power produced by the given IVs.',
  options: [
    {
      name: 'hp',
      type: 4,
      description: 'The Pokemon\'s HP IV, between 0 and 31.',
      required: true,
      min_value: 0,
      max_value: 31,
      
    },
    {
      name: 'atk',
      type: 4,
      description: 'The Pokemon\'s Attack IV, between 0 and 31.',
      required: true,
      min_value: 0,
      max_value: 31,
    },
    {
      name: 'def',
      type: 4,
      description: 'The Pokemon\'s Defence IV, between 0 and 31.',
      required: true,
      min_value: 0,
      max_value: 31,
    },
    {
      name: 'spa',
      type: 4,
      description: 'The Pokemon\'s Special Attack IV, between 0 and 31.',
      required: true,
      min_value: 0,
      max_value: 31,
    },
    {
      name: 'spd',
      type: 4,
      description: 'The Pokemon\'s Special Defence IV, between 0 and 31.',
      required: true,
      min_value: 0,
      max_value: 31,
    },
    {
      name: 'spe',
      type: 4,
      description: 'The Pokemon\'s Speed IV, between 0 and 31.',
      required: true,
      min_value: 0,
      max_value: 31,
    },
    {
      name: 'gen',
      type: 4,
      description: 'The Generation to calculate for.',
      choices: [
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
      ]
    },
  ],
}

const process = (interaction) => {
  const args = getargs(interaction).params;
  args.gen ??= 7;

  const types = new Data.Generations(Sim.Dex).get(args.gen).types;

  const result = types.getHiddenPower(args);

  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      embeds: [buildEmbed({
        fields : [
          {
            name: 'Type',
            value: result['type'],
            inline: true,
          },
          {
            name: 'Power',
            value: result['power'],
            inline: true,
          },
        ],
        color: colours.types[Data.toID(result['type'])]
      })],
    },
  };
}

module.exports = {
  definition,
  command: {
    process
  },
}

