'use strict';

const { InteractionResponseFlags, InteractionResponseType } = require('discord-interactions');

const getargs = require('discord-getarg');
const { dt } = require('dt-utils');
const buildEmbed = require('embed-builder');
const gens = require('gen-db');

async function process(interaction) {
  const [ effectType, id, gen, verboseArg ] = interaction.data.custom_id.split('|');

  const verbose = !!verboseArg;
  const result = dt[effectType]({
    params: {
      gen,
      name: id,
      verbose
    }
  });

  return {
    type: InteractionResponseType.UPDATE_MESSAGE,
    data: result,
  };
};

module.exports = process;

