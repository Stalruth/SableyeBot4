import fetch from 'node-fetch';

import { getCommandDefinitions } from './src/handlers/AppCommandHandler.js';
import { sableye } from './src/sableye.js';

const CLIENT_SECRET = process.env.CLIENT_SECRET;
const APP_ID = process.env.APP_ID;
const GUILD_ID = process.env.GUILD_ID;

function getOptions(token) {
  return {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': `DiscordBot (github.com/Stalruth/Sableyebot4, v${process.env.npm_package_version})`,
    },
    body: JSON.stringify(getCommandDefinitions()),
  };
}

async function getToken(appId, clientSecret) {
  const authBuffer = Buffer.from(`${appId}:${clientSecret}`, 'utf-8');
  const data = new URLSearchParams();
  data.append('grant_type', 'client_credentials');
  data.append('scope', 'applications.commands.update');
  const result = await fetch('https://discord.com/api/v10/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${authBuffer.toString('base64')}`,
    },
    body: data,
  });
  if(!result.ok) {
    throw new Error(await result.text());
  } else {
    return (await result.json()).access_token;
  }
}

async function main() {
  const token = await getToken(APP_ID, CLIENT_SECRET);
  const result = await fetch(`https://discord.com/api/v10/applications/${APP_ID}`
    + (GUILD_ID ? `/guilds/${GUILD_ID}` : '') + `/commands`, getOptions(token));
  if(result.ok) {
    console.log('Updated!');
  } else {
    console.log('Oh no!');
    console.log(await result.json());
  }
}

await main();

