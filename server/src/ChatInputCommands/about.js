import { ButtonStyleTypes, InteractionResponseType, MessageComponentTypes } from 'discord-interactions';

import { buildEmbed } from '#utils/embed-builder';

const definition = {
  description: 'About Sableye Bot',
};

async function process(interaction, respond) {
  return await respond({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      embeds: [buildEmbed({
        title: 'About Sableye Bot',
        description: 'Competitive Pokemon Discord Bot',
        url: 'https://sableye-bot.xyz/',
        author: {
          name: '@stalruth',
          icon_url: 'https://cdn.discordapp.com/avatars/112038152390123520/56a380f68b4127e8bc49d8e08dd6bd6e.webp',
        },
        fields: [
          {
            name: 'Support Server',
            value: 'https://discord.gg/etUxhVfA7u',
          },
          {
            name: 'Language',
            value: 'JavaScript (Powered by [express.js](https://expressjs.com/))',
          },
        ],
      })],
      components: [{
        type: MessageComponentTypes.ACTION_ROW,
        components: [
          {
            type: MessageComponentTypes.BUTTON,
            style: ButtonStyleTypes.LINK,
            label: 'Add to Server',
            url: 'https://discord.com/api/oauth2/authorize?client_id=211522070620667905&permissions=0&scope=bot%20applications.commands',
          },
          
          {
            type: MessageComponentTypes.BUTTON,
            style: ButtonStyleTypes.LINK,
            label: 'Terms of Use',
            url: 'https://sableye-bot.xyz/TERMS',
          },
          
          {
            type: MessageComponentTypes.BUTTON,
            style: ButtonStyleTypes.LINK,
            label: 'Privacy Policy',
            url: 'https://sableye-bot.xyz/PRIVACY',
          },
        ],
      }],
    },
  });
};

export default {
  definition,
  command: {
    process,
  },
};

