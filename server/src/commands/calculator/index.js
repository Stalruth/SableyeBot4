import { InteractionResponseType } from 'discord-interactions';

import { buildEmbed } from '#utils/embed-builder';

const definition = {
  description: 'Get links to Damage Calculators.',
  integration_types: [0, 1],
  contexts: [0, 1, 2]
};

async function process(interaction, respond) {
  return await respond({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      embeds: [buildEmbed({
        title: 'Damage Calculator',
        description: '[Pokémon Showdown Damage Calculator](https://calc.pokemonshowdown.com/index.html)\n[Nimbasa City Post Damage Calculator (VGC)](https://nerd-of-now.github.io/NCP-VGC-Damage-Calculator/)',
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

