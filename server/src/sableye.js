'use strict';

const { onApplicationCommand, onAutocomplete } = require('./handlers/AppCommandHandler.js');
const onComponentInteraction = require('./handlers/MessageComponentHandler.js');

const handlers = {
  2: onApplicationCommand,
  3: onComponentInteraction,
  4: onAutocomplete
};

module.exports.sableye = (req, res) => {
  handlers[req.body['type']](req, res);
};

