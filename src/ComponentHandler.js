'use strict';

const commands = [];

function addComponent(pattern, process) {
  commands.push({pattern, process});
}

addComponent(/^filter_/, require('./MessageComponents/filter.js'));

function onComponentInteraction(req, res) {
  console.log(req.body.type, req.body.id, req.body.data.custom_id);
  for(const command of commands) {
    if(req.body.data.custom_id.match(command.pattern)) {
      command.process(req, res);
      return;
    }
  }
}

module.exports = onComponentInteraction;

