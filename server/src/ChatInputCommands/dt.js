import Data from './data.js';

export default {
  definition: {
    description: 'Alias for `/data`.',
    options: Data.definition.options,
  },
  command: Data.command,
};

