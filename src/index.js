'use strict';

const functions = require('firebase-functions');

module.exports.sableye = functions.https.onRequest((req, res) => {
  const sableye = require('./sableye.js');
  sableye.sableye(req, res);
});

module.exports.onFilter = functions.database
.ref('/filters/{commandId}')
.onCreate(async (snapshot, context) => {
  const onFilter = require('./onFilter.js');
  return onFilter.onFilter(snapshot, context);
});

module.exports.clearFilters = functions.pubsub
.schedule('*/5 * * * *')
.onRun(async (context) => {
  const clearFilters = require('./clearFilters.js');
  return await clearFilters.clearFilters(context);
});

