import gsc from './gsc.js';
import rse from './rse.js';
import xy from './xy.js';

const definition = {
  description: 'Calculate the Type and Power of Hidden Power based on the given IVs or DVs.',
  options: [
    Object.assign({
      name: 'gsc',
      type: 1
    }, gsc.definition),
    Object.assign({
      name: 'rse',
      type: 1
    }, rse.definition),
    Object.assign({
      name: 'xy',
      type: 1
    }, xy.definition)
  ]
};

export default {
  definition,
  command: {
    'gsc': gsc.command,
    'rse': rse.command,
    'xy': xy.command
  }
};
