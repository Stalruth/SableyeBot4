'use strict';

const { verifyKeyMiddleware } = require('discord-interactions');
const express = require('express');

const { sableye } = require('./sableye.js');

const PUBLIC_KEY = process.env.PUBLIC_KEY;
const PORT = process.env.PORT;

const app = express();

app.post('/', verifyKeyMiddleware(PUBLIC_KEY), sableye);

app.listen(PORT);

