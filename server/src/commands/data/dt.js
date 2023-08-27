import Data from './index.js';

export default {
  definition: {
    description: 'Alias for `/data`.',
    options: Data.definition.options,
  },
  command: Data.command,
};

