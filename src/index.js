'use strict';

const express = require('express');

const setupApplication = require('discord-express');

const { onApplicationCommand, onAutocomplete } = require('./AppCommandHandler.js');
const onComponentInteraction = require('./ComponentHandler.js');
const onPing = require('./PingHandler.js');

const PUBLIC_KEY = process.env.PUBLIC_KEY;
const PORT = process.env.PORT;
const BOT_PATH = process.env.BOT_PATH;
const app = express();

setupApplication(app, PUBLIC_KEY, BOT_PATH, {
  1: onPing,
  2: onApplicationCommand,
  3: onComponentInteraction,
  4: onAutocomplete
});

app.listen(PORT);

