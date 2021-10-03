const fromStab = require('./coverage/from-stab.js');
const fromTypes = require('./coverage/from-types.js');

const command = {
  description: 'Returns type coverage based on a Pokémon STAB or types.',
  options: [
    Object.assign({
      name: 'from-stab',
      type: 1,
    }, fromStab.command),
    Object.assign({
      name: 'from-types',
      type: 1,
    }, fromTypes.command),
  ],
};

const process = {
  'from-stab': fromStab.process,
  'from-types': fromTypes.process,
};

const autocomplete = {
  'from-stab': fromStab.autocomplete,
  'from-types': fromTypes.autocomplete,
}

module.exports = {command, process, autocomplete};

