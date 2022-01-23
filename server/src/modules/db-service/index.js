'use strict';

const loki = require('lokijs');

const db = new loki('sableye.json');
const filters = db.addCollection('filters', {indices: ['interactionId'], ttl: (10 * 60 * 1000), ttlInterval: (2.5 * 60 * 1000)});
filters.on('delete', async (data) => {
  const fetch = (await import('node-fetch')).default;
  try {
    const originalMessage = await fetch(`https://discord.com/api/v9/webhooks/${data.webhook.appId}/${data.webhook.token}/messages/@original`);
    const message = await originalMessage.json();
    message.components = [];
    await fetch(`https://discord.com/api/v9/webhooks/${data.webhook.appId}/${data.webhook.token}/messages/@original`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'DiscordBot (https://github.com/Stalruth/SableyeBot4, 4.0.0-rc3)',
      },
      body: JSON.stringify(message)
    });
  } catch (e) {
    console.log(e);
  }
});

module.exports = {filters};
