const fromName = require('./nature/from-name.js');
const fromStats = require('./nature/from-stats.js');

const command = {
  description: 'Retrieve information about Natures.',
  options: [
    Object.assign({
      name: 'from-name',
      type: 1,
    }, fromName.command),
    Object.assign({
      name: 'from-stats',
      type: 1,
    }, fromStats.command),
  ],
};

const process = {
  'from-name': fromName.process,
  'from-stats': fromStats.process,
};

module.exports = {command, process};

