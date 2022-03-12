'use strict';

const { verifyKeyMiddleware } = require('discord-interactions');
const express = require('express');
const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');

const { sableye } = require('./src/sableye.js');

const PUBLIC_KEY = process.env.PUBLIC_KEY;
const PORT = process.env.PORT;

const app = express();

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Tracing.Integrations.Express({ app }),
  ],
  tracesSampleRate: 1.0,
  release: process.env.npm_package_version,
  autoSessionTracking: false,
});

app.use('/sableye', Sentry.Handlers.requestHandler());

app.use('/sableye', Sentry.Handlers.tracingHandler());

app.post('/sableye', verifyKeyMiddleware(PUBLIC_KEY), sableye);

app.use(Sentry.Handlers.errorHandler());

app.listen(PORT);

