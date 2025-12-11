import { InteractionResponseFlags, MessageComponentTypes } from 'discord-interactions';
import loki from 'lokijs';

import { getComponentsById } from '#utils/get-component';

import { componentIDs } from './component-index.js';

let filters = undefined;

function getFilterCollection() {
  if(filters) {
    return filters;
  }

  const db = new loki('sableye.json');

  //filters = db.addCollection('filters', {indices: ['interactionId'], ttl: (10 * 60 * 1000), ttlInterval: (2.5 * 60 * 1000)});
  filters = db.addCollection('filters', {indices: ['interactionId'], ttl: (1 * 60 * 1000), ttlInterval: (1 * 60 * 1000)});
  filters.on('delete', async (data) => {
    try {
      const originalMessage = await fetch(`https://discord.com/api/v10/webhooks/${data.webhook.appId}/${data.webhook.token}/messages/@original`, {
        headers: {
          'User-Agent': `DiscordBot (https://github.com/Stalruth/SableyeBot4, v${process.env.npm_package_version})`,
        }
      });

      const message = await originalMessage.json();
      const components = getComponentsById(message, componentIDs);

      const body = message.flags & InteractionResponseFlags.IS_COMPONENTS_V2 == 0 ? {
        ...message,
        components: []
      } : {
        flags: message.flags,
        components: [
          {
            type: MessageComponentTypes.CONTAINER,
            accent_color: 0x5F32AB,
            id: componentIDs.ROOT,
            components: components.ROOT.components.filter(el => el.id != componentIDs.BUTTON_BAR)
          }
        ]
      };

      await fetch(`https://discord.com/api/v10/webhooks/${data.webhook.appId}/${data.webhook.token}/messages/@original`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': `DiscordBot (https://github.com/Stalruth/SableyeBot4, v${process.env.npm_package_version})`,
        },
        body: JSON.stringify(body)
      });
    } catch (e) {
      console.log(e);
    }

  });

  return filters;
}

export default { getFilterCollection };
