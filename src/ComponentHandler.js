'use strict';

const processes = {};
const modulePaths = {};

function initComponent(name) {
  processes[name] = require(modulePaths[name]);
};

function addComponent(name, modulePath) {
  modulePaths[name] = modulePath;
};

addComponent('filter', './MessageComponents/filter.js');

async function onComponentInteraction(req, res) {
  console.log(req.body.type, req.body.id, req.body.message.interaction.name, req.body.data.custom_id);

  try {
    initComponent(req.body.message.interaction.name);
    res.json(await processes[req.body.message.interaction.name](req.body));
  } catch (e) {
    console.error(e);
  }

  return;
}

module.exports = onComponentInteraction;

