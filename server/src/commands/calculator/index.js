import { ButtonStyleTypes, InteractionResponseType, InteractionResponseFlags, MessageComponentTypes } from 'discord-interactions';

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
      flags: InteractionResponseFlags.IS_COMPONENTS_V2,
      components: [
        {
          type: MessageComponentTypes.CONTAINER,
          accent_color: 0x5F32AB,
          components: [
            {
              type: MessageComponentTypes.TEXT_DISPLAY,
              content: '# Damage Calculators'
            },
            {
              type: MessageComponentTypes.ACTION_ROW,
              components: [
                {
                  type: MessageComponentTypes.BUTTON,
                  style: ButtonStyleTypes.LINK,
                  label: 'Pokémon Showdown',
                  url: 'https://calc.pokemonshowdown.com/index.html'
                },
                {
                  type: MessageComponentTypes.BUTTON,
                  style: ButtonStyleTypes.LINK,
                  label: 'Nimbasa City Post (VGC)',
                  url: 'https://nerd-of-now.github.io/NCP-VGC-Damage-Calculator/'
                },
              ]
            }
          ]
        }
      ],
    },
  });
};

export default {
  definition,
  command: {
    process,
  },
};

