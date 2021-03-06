import { InteractionResponseType } from 'discord-interactions';

import { buildEmbed } from 'embed-builder';

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
          name: 'stalruth#3021',
          icon_url: 'https://cdn.discordapp.com/avatars/112038152390123520/56a380f68b4127e8bc49d8e08dd6bd6e.webp',
        },
        fields: [
          {
            name: 'Invite Link',
            value: '[Click Here](https://discord.com/api/oauth2/authorize?client_id=211522070620667905&permissions=0&scope=bot%20applications.commands)',
            inline: true,
          },
          {
            name: 'Support Server',
            value: 'https://discord.gg/etUxhVfA7u',
            inline: true,
          },
          {
            name: 'Language',
            value: 'JavaScript (Powered by [express.js](https://expressjs.com/))',
          },
          {
            name: 'Privacy Policy',
            value: 'https://sableye-bot.xyz/PRIVACY',
            inline: true,
          },
          {
            name: 'Terms of Use',
            value: 'https://sableye-bot.xyz/TERMS',
            inline: true,
          },
        ],
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

