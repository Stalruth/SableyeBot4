'use strict';

const command = {
  description: 'About SableyeBot',
};

const process = async function(client, interaction) {
  await interaction.editReply({
    embeds: [{
      title: 'About SableyeBot',
      description: 'Competitive Pokemon Discord Bot',
      url: 'https://github.com/StAlRuth/SableyeBot4',
      author: {
        name: 'stalruth#3021',
        icon_url: 'https://cdn.discordapp.com/avatars/112038152390123520/56a380f68b4127e8bc49d8e08dd6bd6e.webp',
      },
      color: 0x5F32AB,
      fields: [
        {
          name: 'Invite Link',
          value: '[Click here](https://discord.com/api/oauth2/authorize?client_id=211522070620667905&permissions=0&scope=bot%20applications.commands)',
        },
        {
          name: 'Language',
          value: 'JavaScript (using [discord.js v13 Beta](https://discord.js.org))',
        },
      ],
      footer: {
        text: `SableyeBot version 4.0.0-alpha`,
      },
    }],
  });
};

module.exports = {command, process};

