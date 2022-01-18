const fromStats = require('./hiddenpower/from-stats.js');
const fromType = require('./hiddenpower/from-type.js');

const command = {
  description: 'Retrieve information about Hidden Power.',
  options: [
    Object.assign({
      name: 'from-stats',
      type: 1,
    }, fromStats.command),
    Object.assign({
      name: 'from-type',
      type: 1,
    }, fromType.command),
  ],
};

const process = {
  'from-stats': fromStats.process,
  'from-type': fromType.process,
};

module.exports = {command, process};

