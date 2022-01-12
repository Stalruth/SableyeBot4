'use strict';

const { InteractionResponseType } = require('discord-interactions');
const Data = require('@pkmn/data');
const Sim = require('@pkmn/sim');

const colours = require('pkmn-colours');
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
    'Hardy': 'atk',
    'Docile': 'def',
    'Bashful': 'spa',
    'Quirky': 'spd',
    'Serious': 'spe',
  };
  
  const fullNames = {
    'atk': 'Attack',
    'def': 'Defence',
    'spa': 'Special Attack',
    'spd': 'Special Defence',
    'spe': 'Speed',
  };

  const nature = natures.get(args.name);

  const title = nature.name;
  const fields = [
    {
      name: 'Boosted',
      value: fullNames[nature['plus'] ? nature['plus'] : neutralNatures[nature.name]],
      inline: true,
    },
    {
      name: 'Lowered',
      value: fullNames[nature['minus'] ? nature['minus'] : neutralNatures[nature.name]],
      inline: true,
    },
  ];

  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      embeds: [buildEmbed({
        title,
        fields,
        color: colours.stats[nature.plus],
      })],
    },
  };
}

module.exports = {command, process}

