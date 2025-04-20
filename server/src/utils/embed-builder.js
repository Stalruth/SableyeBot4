function buildEmbed(options) {
  const defaults = {
    color: 0x5F32AB,
    footer: {
      text: `Sableye version ${process.env.npm_package_version}`,
      icon_url: 'https://cdn.discordapp.com/avatars/1254384836685336616/45661f92f3f0a37a5551bc3c5c372549.webp',
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

export { buildEmbed, buildError };

