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
    throw new Error('You must specify a Discord client public key');
  }

  return async function (req, res, next) {
    const timestamp = (req.header('X-Signature-Timestamp') || '');
    const signature = (req.header('X-Signature-Ed25519') || '');

    async function onBodyComplete(rawBody) {
      if (!await verify(rawBody, signature, timestamp, clientPublicKey, webcrypto.subtle)) {
        res.statusCode = 401;
        res.end('[discord-interactions] Invalid signature');
        return;
      }

      const body = JSON.parse(rawBody.toString('utf-8')) || {};
      if (body.type === InteractionType.PING) {
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            type: InteractionResponseType.PONG,
          }),
        );
        return;
      }

      req.body = body;
      next();
    }

    if (req.body) {
      if (Buffer.isBuffer(req.body)) {
        await onBodyComplete(req.body);
      } else if (typeof req.body === 'string') {
        await onBodyComplete(Buffer.from(req.body, 'utf-8'));
      } else {
        console.warn(
          '[discord-interactions]: req.body was tampered with, probably by some other middleware. We recommend disabling middleware for interaction routes so that req.body is a raw buffer.',
        );
        // Attempt to reconstruct the raw buffer. This works but is risky
        // because it depends on JSON.stringify matching the Discord backend's
        // JSON serialization.
        await onBodyComplete(Buffer.from(JSON.stringify(req.body), 'utf-8'));
      }
    } else {
      const chunks = [];
      req.on('data', (chunk) => {
        chunks.push(chunk);
      });
      req.on('end', async () => {
        const rawBody = Buffer.concat(chunks);
        await onBodyComplete(rawBody);
      });
    }
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

