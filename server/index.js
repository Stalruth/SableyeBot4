'use strict';

import { webcrypto } from 'node:crypto';

import { InteractionResponseType, InteractionType } from 'discord-interactions';
import { verify } from 'discord-verify';
import express from 'express';
import Sentry from '@sentry/node';
import Tracing from '@sentry/tracing';

import { sableye } from './src/sableye.js';

const PUBLIC_KEY = process.env.PUBLIC_KEY;
const PORT = process.env.PORT;

const app = express();

function verifyKeyMiddleware(clientPublicKey) {
  if (!clientPublicKey) {
    throw new Error('Missing Public Key');
  }

  return async function (req, res, next) {
    const timestamp = req.header('X-Signature-Timestamp') || '';
    const signature = req.header('X-Signature-Ed25519') || '';

    const chunks = [];
    req.on('data', (chunk) => {
      chunks.push(chunk);
    });

    req.on('end', async () => {
      const rawBody = Buffer.concat(chunks);
      if (!await verify(rawBody, signature, timestamp, clientPublicKey, webcrypto.subtle)) {
        res.statusCode = 401;
        res.end('Invalid signature');
        return;
      }

      req.body = JSON.parse(rawBody);
      next();
    });
  };
}

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Tracing.Integrations.Express({ app }),
  ],
  tracesSampleRate: 0.15,
  release: process.env.npm_package_version,
  autoSessionTracking: false,
});

app.use('/', Sentry.Handlers.requestHandler());

app.use('/', Sentry.Handlers.tracingHandler());

app.post('/', verifyKeyMiddleware(PUBLIC_KEY), sableye);

app.use(Sentry.Handlers.errorHandler());

app.listen(PORT);

