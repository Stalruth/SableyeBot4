import loki from 'lokijs';
import fetch from 'node-fetch';

let filters = undefined;

function getFilterCollection() {
  if(filters) {
    return filters;
  }

  const db = new loki('sableye.json');

  filters = db.addCollection('filters', {indices: ['interactionId'], ttl: (10 * 60 * 1000), ttlInterval: (2.5 * 60 * 1000)});
  filters.on('delete', async (data) => {
    try {
      const originalMessage = await fetch(`https://discord.com/api/v10/webhooks/${data.webhook.appId}/${data.webhook.token}/messages/@original`, {
        headers: {
          'User-Agent': `DiscordBot (https://github.com/Stalruth/SableyeBot4, v${process.env.npm_package_version})`,
        }
      });
      const message = await originalMessage.json();
      message.components = [];
      await fetch(`https://discord.com/api/v10/webhooks/${data.webhook.appId}/${data.webhook.token}/messages/@original`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': `DiscordBot (https://github.com/Stalruth/SableyeBot4, v${process.env.npm_package_version})`,
        },
        body: JSON.stringify(message)
      });
    } catch (e) {
      console.log(e);
    }
  });

  return filters;
}

export default { getFilterCollection };
