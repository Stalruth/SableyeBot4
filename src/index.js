'use strict';

const express = require('express');

const { signatureMiddleware, setupApplication, ping } = require('./discord-express');
const { onInteractionCreate } = require('./CommandHandler.js');

const PUBLIC_KEY = process.env.PUBLIC_KEY;
const app = express();
const port = process.env.PORT;

function respond(req, res) {
  onInteractionCreate(req, res);
}

setupApplication(app, PUBLIC_KEY, '/', [ping, respond]);

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});

