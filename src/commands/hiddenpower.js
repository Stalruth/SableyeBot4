const fromStats = require('./hiddenpower/from-stats.js');
const fromType = require('./hiddenpower/from-type.js');

const command = {
  description: 'Retrieve information about Hidden Powers.',
  options: [
    Object.assign({
      name: 'from-stats',
      type: 'SUB_COMMAND',
    }, fromStats.command),
    Object.assign({
      name: 'from-type',
      type: 'SUB_COMMAND',
    }, fromType.command),
  ],
};

const process = {
  null: {
    'from-stats': fromStats.process,
    'from-type': fromType.process,
  },
};

module.exports = {command, process};

