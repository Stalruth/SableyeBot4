import { InteractionResponseFlags, InteractionResponseType } from 'discord-interactions';

import getargs from 'discord-getarg';
import getLinkingCode from 'link-code';
import { buildEmbed } from 'embed-builder';

const definition = {
  type: 2,
};

async function process(interaction, respond) {

  const linkingCode = getLinkingCode([interaction.member.user.id, interaction.data.target_id]);

  const partnerName = interaction.data.resolved.members?.[interaction.data.target_id].nick ?? interaction.data.resolved.users?.[interaction.data.target_id].username;

  return await respond({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      embeds: [buildEmbed({
        description: `Your linking code for use with **${partnerName}** is **${linkingCode}**`,
      })],
      flags: InteractionResponseFlags.EPHEMERAL,
    },
  });
};

export default {
  definition,
  command: {
    process
  }
};

