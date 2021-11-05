'use strict';

const express = require('express');
const functions = require('firebase-functions');

const setupApplication = require('discord-express');

const { onApplicationCommand, onAutocomplete } = require('./AppCommandHandler.js');
const onComponentInteraction = require('./ComponentHandler.js');
const onPing = require('./PingHandler.js');

const PUBLIC_KEY = functions.config().sableye.public_key;
const app = express();

app.use((req, res, next) => {
  req.body = req.rawBody;
  next();
});

setupApplication(app, PUBLIC_KEY, '/', {
  1: onPing,
  2: onApplicationCommand,
  3: onComponentInteraction,
  4: onAutocomplete
});

module.exports.sableye = functions.https.onRequest(app);

