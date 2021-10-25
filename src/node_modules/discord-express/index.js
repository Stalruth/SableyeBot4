'use strict';

const { verifyKeyMiddleware } = require('discord-interactions');

function setupApplication(app, publicKey, route, handlers) {
  app.post(route, verifyKeyMiddleware(publicKey), (req, res) => {
    const handler = handlers[req.body['type']] ?? (() => {});
    handler(req, res);
  });
}

module.exports = setupApplication;

