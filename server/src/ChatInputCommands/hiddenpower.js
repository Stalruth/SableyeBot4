import fromStats from './hiddenpower/from-stats.js';
import fromType from './hiddenpower/from-type.js';

const definition = {
  description: 'Retrieve information about Hidden Power.',
  options: [
    Object.assign({
      name: 'from-stats',
      type: 1,
    }, fromStats.definition),
    Object.assign({
      name: 'from-type',
      type: 1,
    }, fromType.definition),
  ],
};

export default {
  definition,
  command: {
    'from-stats': fromStats.command,
    'from-type': fromType.command,
  }
};

