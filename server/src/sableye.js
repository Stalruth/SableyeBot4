'use strict';

const { verifyKey } = require('discord-interactions');

const { onApplicationCommand, onAutocomplete } = require('./handlers/AppCommandHandler.js');
const onComponentInteraction = require('./handlers/MessageComponentHandler.js');
const onPing = require('./handlers/PingHandler.js');

const handlers = {
  1: onPing,
  2: onApplicationCommand,
  3: onComponentInteraction,
  4: onAutocomplete
};

module.exports.sableye = (req, res) => {
  handlers[req.body['type']](req, res);
};

