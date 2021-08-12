'use strict';

const util = require('util');

const Discord = require('discord.js');

const CommandHandler = require('./CommandHandler.js');

const Client = new Discord.Client({
  intents: [
  ]
});

Client.once('ready', async () => {
  CommandHandler.onReady(Client);
});

Client.on('interactionCreate', async (interaction) => {
  CommandHandler.onInteractionCreate(interaction);
});

Client.login(process.env.BOT_TOKEN);

