'use strict';

const { InteractionResponseType } = require('discord-interactions');
const Data = require('@pkmn/data');
const Sim = require('@pkmn/sim');

const getargs = require('discord-getarg');
const buildEmbed = require('embed-builder');

const natures = new Data.Generations(Sim.Dex).get(8).natures;

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

const process = (interaction) => {
  const args = getargs(interaction).params;

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

  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      embeds: [buildEmbed({
        title,
        fields,
      })],
    },
  };
}

module.exports = {command, process}

