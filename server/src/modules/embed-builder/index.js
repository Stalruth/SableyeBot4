'use strict';

function buildEmbed(options) {
  const defaults = {
    color: 0x5F32AB,
    footer: {
      text: `SableyeBot version 4.0.0-rc5`,
      icon_url: 'https://cdn.discordapp.com/avatars/211522070620667905/6b037c17fc6671f0a5dc73803a4c3338.webp',
    },
  };
  return Object.assign(defaults, options);
}

function buildError(description) {
  return buildEmbed({
    title: "Error",
    description: description,
    color: 0xCC0000,
  });
}

module.exports = { buildEmbed, buildError };

