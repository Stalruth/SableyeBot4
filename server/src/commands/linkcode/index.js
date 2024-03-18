import { InteractionResponseFlags, InteractionResponseType } from 'discord-interactions';

import getargs from '#utils/discord-getarg';
import getLinkingCode from '#utils/link-code';
import { buildEmbed } from '#utils/embed-builder';

const definition = {
  description: 'Generate a linking code for you and the user provided.',
  options: [
    {
      name: 'user',
      type: 6,
      description: 'Your trading partner or battle opponent',
      required: true,
    },
  ],
  integration_types: [0, 1],
  contexts: [0, 2]
};

async function process(interaction, respond) {
  const { params } = getargs(interaction);

  const linkingCode = getLinkingCode([interaction.member.user.id, params.user]);

  const partnerName = interaction.data.resolved.members?.[params.user].nick ?? interaction.data.resolved.users?.[params.user].username;

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
    process,
  },
};

