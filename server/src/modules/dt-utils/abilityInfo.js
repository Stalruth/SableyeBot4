'use strict';

const { InteractionResponseFlags } = require('discord-interactions');

const buildEmbed = require('embed-builder');
const gens = require('gen-db');

function abilityInfo(ability, gen, verbose) {
  return {
    embeds: [buildEmbed({
      title: ability['name'],
      description: ability['desc'],
    })],
  };
}

module.exports = abilityInfo;
