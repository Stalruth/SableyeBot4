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
  
  // Uh oh sisters! hardcoding!
  const neutralNatures = {
    atk: 'Hardy',
    def: 'Docile',
    spa: 'Bashful',
    spd: 'Quirky',
    spe: 'Serious',
  };
  
  let title = '';
  let fields = [
    {
      name: 'Boosted',
      value: args.boosted.toUpperCase(),
      inline: true,
    },
    {
      name: 'Lowered',
      value: args.lowered.toUpperCase(),
      inline: true,
    }
  ]
  
  if(args.boosted === args.lowered) {
    title = neutralNatures[args.boosted];
  }

  for(const nature of gen.natures) {
    if (nature.plus === args.boosted && nature.minus === args.lowered) {
      title = nature.name;
      break;
    }
  }

  res.json({
    type: 4,
    data: {
      embeds: [{
        title,
        fields,
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

