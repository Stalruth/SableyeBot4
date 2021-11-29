'use strict';

const { InteractionResponseFlags, InteractionResponseType } = require('discord-interactions');
const Data = require('@pkmn/data');

const getargs = require('discord-getarg');
const buildEmbed = require('embed-builder');
const gens = require('gen-db');
const { completeAll } = require('pkmn-complete');

const dt = {
  Ability: require('./ability.js').process,
  Item: require('./item.js').process,
  Move: require('./move.js').process,
  Nature: require('./nature/from-name.js').process,
  Pokemon: require('./pokemon.js').process,
};

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
  const args = getargs(interaction).params;

  const data = gens.data[args.gen ? args.gen : 'gen8natdex'];

  const result = [
    data.abilities.get(Data.toID(args.name)),
    data.items.get(Data.toID(args.name)),
    data.moves.get(Data.toID(args.name)),
    data.natures.get(Data.toID(args.name)),
    data.species.get(Data.toID(args.name)),
  ].filter(e=>!!e)[0];

  if(!result) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [buildEmbed({
          title: "Error",
          description: `Could not find a result matching ${args.name} in the given generation.`,
          color: 0xCC0000,
        })],
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    };
  }

  return await dt[result.effectType](interaction);
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

