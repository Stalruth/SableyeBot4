'use strict';

const { InteractionResponseFlags, InteractionResponseType } = require('discord-interactions');

const getargs = require('discord-getarg');
const { dt, getData } = require('dt-utils');
const buildEmbed = require('embed-builder');
const gens = require('gen-db');
const { completeAll } = require('pkmn-complete');

const command = {
  description: 'Return information on the given Pokemon, Ability, Move, Item, or Nature.',
  options: [
    {
      name: 'name',
      type: 3,
      description: 'Name of the Pokemon, Ability, Move, Item or Nature to look up.',
      required: true,
      autocomplete: true,
    },
    {
      name: 'verbose',
      type: 5,
      description: 'Return extra information.',
    },
    {
      name: 'gen',
      type: 3,
      description: 'The Generation used for lookup.',
      choices: gens.names,
    },
  ],
};

async function process(interaction) {
  const args = getargs(interaction);
  const { params } = args;

  const data = gens.data[params.gen ? params.gen : 'gen8natdex'];

  const results = getData(data, params.name);

  if(results.length === 0) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [buildEmbed({
          title: "Error",
          description: `Could not find a result matching ${params.name} in the given generation.`,
          color: 0xCC0000,
        })],
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    };
  }
  
  if(results.length === 1) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: dt[results[0].effectType](results[0], data.num, params.verbose),
    };
  }

  if(results.length === 2) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [buildEmbed({
          title: "Disambiguation",
          description: `There are multiple results matching ${params.name}.  Please pick the entity you are looking up below.`,
        })],
        components: [{
          type: 1,
          components: [{
            type: 3,
            custom_id: `${results[0].id}|${params.gen ?? 'gen8natdex'}|${params.verbose ? 'true' : ''}`,
            options: results.map(entity => ({
              label: entity.effectType,
              value: entity.effectType,
            })),
          }],
        }]
      },
    };
  }
};

function autocomplete(interaction) {
  const args = getargs(interaction).params;
  return {
    type: InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
    data: {
      choices: completeAll(args['name']),
    },
  };
}

module.exports = {command, process, autocomplete};

