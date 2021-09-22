'use strict';

const Dex = require('@pkmn/dex');
const Data = require('@pkmn/data');

const { getargs } = require('discord-getarg');

const natures = new Data.Generations(Dex.Dex).get(8).natures;

const listNatures = (natureList) => {
  const result = [];
  for(const nature of natureList) {
    result.push({
      name: nature.name,
      value: nature.id
    });
  }
  return result;
}

const command = {
  description: 'Returns the stats affected by the Nature provided.',
  options: [
    {
      name: 'name',
      type: 3,
      description: 'Name of the Nature.',
      required: true,
      choices: listNatures(natures)
    },
  ],
}

const process = (req, res) => {
  const args = getargs(req.body).params;

  // Uh oh sisters! hardcoding!
  const neutralNatures = {
    'Hardy': 'ATK',
    'Docile': 'DEF',
    'Bashful': 'SPA',
    'Quirky': 'SPD',
    'Serious': 'SPE',
  };

  const nature = natures.get(args.name);
  
  const title = nature.name;
  const fields = [
    {
      name: 'Boosted',
      value: nature['plus'] ? nature['plus'].toUpperCase() : neutralNatures[nature.name],
      inline: true,
    },
    {
      name: 'Lowered',
      value: nature['minus'] ? nature['minus'].toUpperCase() : neutralNatures[nature.name],
      inline: true,
    },
  ];

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

