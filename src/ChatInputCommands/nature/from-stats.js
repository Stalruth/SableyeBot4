'use strict';

let Dex = require('@pkmn/dex');
let Data = require('@pkmn/data');

const { getargs } = require('discord-getarg');

const stats = [
  {
    name: 'Attack',
    value: 'atk',
  },
  {
    name: 'Defence',
    value: 'def',
  },
  {
    name: 'Special Attack',
    value: 'spa',
  },
  {
    name: 'Special Defence',
    value: 'spd',
  },
  {
    name: 'Speed',
    value: 'spe',
  },
];

const command = {
  description: 'Returns the Nature that affects the stats provided.',
  options: [
    {
      name: 'boosted',
      type: 3,
      description: 'Name of the stat boosted by the Nature.',
      required: true,
      choices: stats
    },
    {
      name: 'lowered',
      type: 3,
      description: 'Name of the stat lowered by the Nature.',
      required: true,
      choices: stats
    },
  ],
}

const process = (req, res) => {
  const args = getargs(req.body).params;

  const gen = new Data.Generations(Dex.Dex).get(8);

  if (args.boosted === args.lowered) {
    res.json({
      type: 4,
      data: {
        content: `The Natures without any effect are Hardy, Docile, Bashful, Quirky and Serious.`,
      },
    });
  }

  for(const nature of gen.natures) {
    if (nature.plus === args.boosted && nature.minus === args.lowered) {
      res.json({
        type: 4,
        data: {
          content: `${nature.name}: +${args.boosted.toUpperCase()} -${args.lowered.toUpperCase()}`,
        },
      });
      break;
    }
  }
}

module.exports = {command, process}

