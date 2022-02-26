'use strict';

const { buildEmbed } = require('embed-builder');
const gens = require('gen-db');
const colours = require('pokemon-colours');

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

function natureInfo(nature, gen, verbose) {
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
    embeds: [buildEmbed({
      title,
      fields,
      color: colours.stats[nature.plus],
    })],
  };
}

module.exports = natureInfo;
