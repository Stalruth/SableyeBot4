'use strict';

const functions = require('firebase-functions');

module.exports.clearFilters = functions.pubsub
.schedule('*/5 * * * *')
.onRun(async (context) => {
  const clearFilters = require('./clearFilters.js');
  return await clearFilters.clearFilters(context);
});

