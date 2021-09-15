'use strict';

const express = require('express');

const { setupApplication, onPing } = require('./discord-express');
const { onApplicationCommand } = require('./AppCommandHandler.js');
const { onComponentInteraction } = require('./ComponentHandler.js');

const PUBLIC_KEY = process.env.PUBLIC_KEY;
const PORT = process.env.PORT;
const app = express();

setupApplication(app, PUBLIC_KEY, '/', [onPing, onApplicationCommand, onComponentInteraction]);

app.listen(PORT);

