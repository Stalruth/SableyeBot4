'use strict';

import { verifyKeyMiddleware } from 'discord-interactions';
import express from 'express';
import Sentry from '@sentry/node';
import Tracing from '@sentry/tracing';

import { sableye } from './src/sableye.js';

const PUBLIC_KEY = process.env.PUBLIC_KEY;
const PORT = process.env.PORT;

const app = express();

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

