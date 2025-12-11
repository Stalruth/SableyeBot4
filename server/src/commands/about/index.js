import { ButtonStyleTypes, InteractionResponseType, InteractionResponseFlags, MessageComponentTypes } from 'discord-interactions';

const definition = {
  description: 'About Sableye Bot',
  integration_types: [0, 1],
  contexts: [0, 1, 2]
};

async function command_process(interaction, respond) {
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
              type: MessageComponentTypes.SECTION,
              components: [
                {
                  type: MessageComponentTypes.TEXT_DISPLAY,
                  content: '# About Sableye'
                },
                {
                  type: MessageComponentTypes.TEXT_DISPLAY,
                  content: 'Competitive Pokémon Discord Bot.'
                },
                {
                  type: MessageComponentTypes.TEXT_DISPLAY,
                  content: `-# Currently running version ${process.env.npm_package_version}`
                }
              ],
              accessory: {
                type: MessageComponentTypes.THUMBNAIL,
                media: {
                  url: 'https://cdn.discordapp.com/avatars/1254384836685336616/45661f92f3f0a37a5551bc3c5c372549.webp'
                }
              }
            },
            {
              type: MessageComponentTypes.ACTION_ROW,
              components: [
                {
                  type: MessageComponentTypes.BUTTON,
                  style: ButtonStyleTypes.LINK,
                  label: 'Support Server',
                  url: 'https://discord.gg/etUxhVfA7u'
                },
                {
                  type: MessageComponentTypes.BUTTON,
                  style: ButtonStyleTypes.LINK,
                  label: 'Website',
                  url: 'https://sableye-bot.xyz/'
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
    process: command_process,
  },
};

