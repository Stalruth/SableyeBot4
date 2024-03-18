import Data from './index.js';

export default {
  definition: {
    description: 'Alias for `/data`.',
    options: Data.definition.options,
  },
  command: Data.command,
  integration_types: Data.definition.integration_types,
  contexts: Data.definition.contexts
};

