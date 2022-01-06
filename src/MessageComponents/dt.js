'use strict';

const { InteractionResponseFlags, InteractionResponseType } = require('discord-interactions');

const getargs = require('discord-getarg');
const { dt, getData } = require('dt-utils');
const buildEmbed = require('embed-builder');
const gens = require('gen-db');

async function process(interaction) {
  const [ idOne, gen, verboseArg ] = interaction.data.custom_id.split('|');
  const [ effectType, idTwo ] = interaction.data.values[0].split('|');
  
  const id = idTwo ?? idOne;

  const verbose = !!verboseArg;

  const effect = getData(gens.data[gen], id).filter(e=>e.effectType === effectType)[0];

  const result = dt[effectType](effect, gen, verboseArg);

  result.components = [];

  return {
    type: InteractionResponseType.UPDATE_MESSAGE,
    data: result,
  };
};

module.exports = process;

