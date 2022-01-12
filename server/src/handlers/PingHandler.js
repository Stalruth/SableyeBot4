'use strict';

async function onPing(req, res) {
  res.json({type: 1});
  return;
}

module.exports = onPing

