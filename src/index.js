'use strict';

const express = require('express');

const { setupApplication, onPing } = require('./discord-express');
const { onApplicationCommand } = require('./AppCommandHandler.js');
const { onComponentInteraction } = require('./ComponentHandler.js');

const PUBLIC_KEY = process.env.PUBLIC_KEY;
const PORT = process.env.PORT;
const BOT_PATH = process.env.BOT_PATH;
const app = express();

setupApplication(app, PUBLIC_KEY, BOT_PATH, [onPing, onApplicationCommand, onComponentInteraction]);

app.listen(PORT);

