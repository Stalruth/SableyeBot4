'use strict';

const { InteractionResponseType } = require('discord-interactions');

const buildEmbed = require('embed-builder');

const command = {
  description: 'About SableyeBot',
};

const process = function(interaction) {
  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      embeds: [buildEmbed({
        title: 'About SableyeBot',
        description: 'Competitive Pokemon Discord Bot',
        url: 'https://github.com/StAlRuth/SableyeBot4',
        author: {
          name: 'stalruth#3021',
          icon_url: 'https://cdn.discordapp.com/avatars/112038152390123520/56a380f68b4127e8bc49d8e08dd6bd6e.webp',
        },
        fields: [
          {
            name: 'Invite Link',
            value: '[Click here](https://discord.com/api/oauth2/authorize?client_id=211522070620667905&permissions=0&scope=bot%20applications.commands)',
          },
          {
            name: 'Language',
            value: 'JavaScript (Powered by [express.js](https://expressjs.com/) and [Google Firebase](https://firebase.google.com))',
          },
        ],
      })],
    },
  };
};

module.exports = {command, process};
