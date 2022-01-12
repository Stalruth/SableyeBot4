'use strict';

function buildEmbed(options) {
  const defaults = {
    color: 0x5F32AB,
    footer: {
      text: `SableyeBot version 4.0.0-sigma`,
      icon_url: 'https://cdn.discordapp.com/avatars/211522070620667905/6b037c17fc6671f0a5dc73803a4c3338.webp',
    },
  };
  return Object.assign(defaults, options);
}

module.exports = buildEmbed;
