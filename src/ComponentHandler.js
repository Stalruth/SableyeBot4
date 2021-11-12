'use strict';

const processes = {};
const autocompletes = {};

const addComponent = async function(name, process) {
  processes[name] = process;
};

addComponent('filter', require('./MessageComponents/filter.js'));

async function onComponentInteraction(req, res) {
  console.log(req.body.type, req.body.id, req.body.message.interaction.name, req.body.data.custom_id);
  res.json(await processes[req.body.message.interaction.name](req.body));
  return;
}

module.exports = onComponentInteraction;

