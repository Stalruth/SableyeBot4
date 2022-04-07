import { InteractionResponseType } from 'discord-interactions';

import { buildEmbed } from 'embed-builder';

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

export default {
  definition,
  command: {
    process,
  },
};

