'use strict';

const util = require('util');

const Discord = require('discord.js');
const Client = new Discord.Client({
  intents: [
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_MESSAGES
  ]
});

const CommandHandler = require('./CommandHandler.js');

Client.once('ready', async () => {
  CommandHandler.onReady(Client);
});

Client.on('interactionCreate', async (interaction) => {
  CommandHandler.onInteractionCreate(Client, interaction);
});

Client.login(process.env.BOT_TOKEN);

