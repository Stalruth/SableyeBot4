import { InteractionResponseFlags, MessageComponentTypes } from 'discord-interactions';

import { buildEmbed } from '#utils/embed-builder';
import gens from '#utils/gen-db';

import { componentIDs } from './component-index.js';

function abilityInfo(ability) {
  return {
    flags: InteractionResponseFlags.IS_COMPONENTS_V2,
    components: [
      {
        id: componentIDs.ROOT,
        type: MessageComponentTypes.CONTAINER,
        accent_color: 0x5F32AB,
        components: [
          {
            type: MessageComponentTypes.TEXT_DISPLAY,
            content: `# Ability: ${ability['name']}\n${ability['desc'] || ability['shortDesc']}`
          }
        ]
      }
    ]
  };
}

export default abilityInfo;
