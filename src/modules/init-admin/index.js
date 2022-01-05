'use strict';

const admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.cert(require('./key.json')),
  databaseURL: process.env.DATABASE_URL,
});

module.exports = admin;
