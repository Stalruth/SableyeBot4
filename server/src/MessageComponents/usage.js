import { InteractionResponseFlags, InteractionResponseType } from 'discord-interactions';

import { buildError } from '#utils/embed-builder';

async function process(interaction, respond) {
  respond({
    type: InteractionResponseType.UPDATE_MESSAGE,
    data: {
      embeds: interaction.message.embeds,
      components: [],
    },
  });
  
  await fetch(`https://discord.com/api/v10/webhooks/${interaction.application_id}/${interaction.token}`,
    {
      method: 'POST',
      body: JSON.stringify({
        embeds: [
          buildError('This format is not longer supported.')
        ],
        flags: InteractionResponseFlags.EPHEMERAL,
      }),
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': `DiscordBot (https://github.com/Stalruth/SableyeBot4, v${process.env.npm_package_version})`,
      },
    }
  );
}

export default process;
