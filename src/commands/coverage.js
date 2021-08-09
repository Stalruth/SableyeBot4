const fromStab = require('./coverage/from-stab.js');
const fromTypes = require('./coverage/from-types.js');

const command = {
  description: 'Returns type coverage based on a Pokémon STAB or types.',
  options: [
    Object.assign({
      name: 'from-stab',
      type: 'SUB_COMMAND',
    }, fromStab.command),
    Object.assign({
      name: 'from-types',
      type: 'SUB_COMMAND',
    }, fromTypes.command),
  ],
};

const process = {
  null: {
    'from-stab': fromStab.process,
    'from-types': fromTypes.process,
  },
};

module.exports = {command, process};

