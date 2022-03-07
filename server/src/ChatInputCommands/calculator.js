'use strict';

const { InteractionResponseType } = require('discord-interactions');

const { buildEmbed } = require('embed-builder');

const definition = {
  description: 'Link to Damage Calculators.',
};

const process = function(interaction) {
  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      embeds: [buildEmbed({
        title: 'Damage Calculator',
        description: '[Pokémon Showdown Damage Calculator](https://calc.pokemonshowdown.com/index.html)\n[Pikalytics Damage Calculator](https://www.pikalytics.com/calc)',
      })],
    },
  };
};

module.exports = {
  definition,
  command: {
    process,
  },
};

