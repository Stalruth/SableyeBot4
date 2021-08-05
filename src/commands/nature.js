const fromName = require('./nature/from-name.js');
const fromStats = require('./nature/from-stats.js');

const command = {
  description: 'Retrieve information about Natures.',
  options: [
    Object.assign({
      name: 'from-name',
      type: 'SUB_COMMAND',
    }, fromName.command),
    Object.assign({
      name: 'from-stats',
      type: 'SUB_COMMAND',
    }, fromStats.command),
  ],
};

const process = {
  null: {
    'from-name': fromName.process,
    'from-stats': fromStats.process,
  },
};

module.exports = {command, process};

