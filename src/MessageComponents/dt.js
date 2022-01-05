'use strict';

const { InteractionResponseFlags, InteractionResponseType } = require('discord-interactions');

const getargs = require('discord-getarg');
const { dt } = require('dt-utils');
const buildEmbed = require('embed-builder');
const gens = require('gen-db');

async function process(interaction) {
  const [ id, gen, verboseArg ] = interaction.data.custom_id.split('|');
  const effectType = interaction.data.values[0];

  const verbose = !!verboseArg;
  const result = dt[effectType]({
    params: {
      gen,
      name: id,
      verbose
    }
  });

  result.components = [];

  return {
    type: InteractionResponseType.UPDATE_MESSAGE,
    data: result,
  };
};

module.exports = process;

