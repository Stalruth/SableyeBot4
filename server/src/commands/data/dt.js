import Data from './index.js';

export default {
  definition: {
    description: 'Alias for `/data`.',
    options: Data.definition.options,
    integration_types: Data.integration_types,
    contexts: Data.contexts
  },
  command: Data.command
};

