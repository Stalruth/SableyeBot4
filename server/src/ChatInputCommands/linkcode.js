import { InteractionResponseFlags, InteractionResponseType } from 'discord-interactions';

import getargs from 'discord-getarg';
import getLinkingCode from 'link-code';
import { buildEmbed } from 'embed-builder';

const definition = {
  description: 'Generate a linking code for you and the user provided.',
  dm_permission: false,
  options: [
    {
      name: 'user',
      type: 6,
      description: 'Your trading partner or battle opponent',
      required: true,
    },
  ],
};

const process = function(interaction) {
  const { params } = getargs(interaction);

  const linkingCode = getLinkingCode([interaction.member.user.id, params.user]);

  const partnerName = interaction.data.resolved.members?.[params.user].nick ?? interaction.data.resolved.users?.[params.user].username;

  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      embeds: [buildEmbed({
        description: `Your linking code for use with **${partnerName}** is **${linkingCode}**`,
      })],
      flags: InteractionResponseFlags.EPHEMERAL,
    },
  };
};

export default {
  definition,
  command: {
    process,
  },
};

