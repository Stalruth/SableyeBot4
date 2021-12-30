'use strict';

const { verifyKey } = require('discord-interactions');
const functions = require('firebase-functions');

const { onApplicationCommand, onAutocomplete } = require('./AppCommandHandler.js');
const onComponentInteraction = require('./ComponentHandler.js');
const onPing = require('./PingHandler.js');

const PUBLIC_KEY = functions.config().sableye.public_key;

const handlers = {
  1: onPing,
  2: onApplicationCommand,
  3: onComponentInteraction,
  4: onAutocomplete
};

module.exports.sableye = (req, res) => {
  if(!verifyKey(req.rawBody,
      req.header('X-Signature-Ed25519'),
      req.header('X-Signature-Timestamp'),
      PUBLIC_KEY)) {
    res.statusCode = 401;
    return res.end('Invalid signature!');
  }

  handlers[req.body['type']](req, res);
};

