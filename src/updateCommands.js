'use strict';

const fetch = require('node-fetch');

const { getCommandDefinitions } = require('./AppCommandHandler.js');

const BOT_TOKEN = process.env.BOT_TOKEN;
const APP_ID = process.env.APP_ID;
const GUILD_ID = process.env.GUILD_ID;

const options = {
  method: 'PUT',
  headers: {
    'Authorization': `Bot ${BOT_TOKEN}`,
    'Content-Type': 'application/json',
    'User-Agent': 'DiscordBot (github.com/Stalruth/Sableyebot4, 4.x)',
  },
  body: JSON.stringify(getCommandDefinitions()),
};

async function main() {
  const result = await fetch(`https://discord.com/api/applications/${APP_ID}`
    + (GUILD_ID ? `/guilds/${GUILD_ID}` : '') + `/commands`, options);
  if(result.ok) {
    console.log('Updated!');
  } else {
    console.log('Oh no!');
    console.log(await result.json());
  }
}

main();
