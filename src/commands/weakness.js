const fromPokemon = require('./weakness/from-pokemon.js');
const fromTypes = require('./weakness/from-types.js');

const command = {
  description: 'Weaknesses based on a given Pokémon or types.',
  options: [
    Object.assign({
      name: 'from-pokemon',
      type: 'SUB_COMMAND',
    }, fromPokemon.command),
    Object.assign({
      name: 'from-types',
      type: 'SUB_COMMAND',
    }, fromTypes.command),
  ],
};

const process = {
  null: {
    'from-pokemon': fromPokemon.process,
    'from-types': fromTypes.process,
  },
};

module.exports = {command, process};

