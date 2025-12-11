import { InteractionResponseFlags, InteractionResponseType, MessageComponentTypes } from 'discord-interactions';

import getLinkingCode from '#utils/link-code';
import { buildEmbed } from '#utils/embed-builder';

const definition = {
  type: 2,
  integration_types: [0, 1],
  contexts: [0, 2]
};

async function process(interaction, respond) {

  const linkingCode = getLinkingCode([interaction.member.user.id, interaction.data.target_id]);

  const partnerName = interaction.data.resolved.members?.[interaction.data.target_id].nick ?? interaction.data.resolved.users?.[interaction.data.target_id].username;

  return await respond({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      flags: InteractionResponseFlags.EPHEMERAL | InteractionResponseFlags.IS_COMPONENTS_V2,
      components: [
        {
          type: MessageComponentTypes.CONTAINER,
          accent_color: 0x5F32AB,
          components: [
            {
              type: MessageComponentTypes.TEXT_DISPLAY,
              content: `Your linking code for use with **${partnerName}** is **${linkingCode}**`
            }
          ]
        }
      ],
    },
  });
};

export default {
  definition,
  command: {
    process
  }
};

