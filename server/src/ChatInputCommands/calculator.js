import { InteractionResponseType } from 'discord-interactions';

import { buildEmbed } from 'embed-builder';

const definition = {
  description: 'Get links to Damage Calculators.',
};

async function process(interaction, respond) {
  return await respond({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      embeds: [buildEmbed({
        title: 'Damage Calculator',
        description: '[Pokémon Showdown Damage Calculator](https://calc.pokemonshowdown.com/index.html)\n[Pikalytics Damage Calculator](https://www.pikalytics.com/calc)',
      })],
    },
  });
};

export default {
  definition,
  command: {
    process,
  },
};

