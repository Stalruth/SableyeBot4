const fromPokemon = require('./weakness/from-pokemon.js');
const fromTypes = require('./weakness/from-types.js');

const definition = {
  description: 'Weaknesses based on a given Pokémon or types.',
  options: [
    Object.assign({
      name: 'from-pokemon',
      type: 1,
    }, fromPokemon.definition),
    Object.assign({
      name: 'from-types',
      type: 1,
    }, fromTypes.definition),
  ],
};

const process = {
  'from-pokemon': fromPokemon.process,
  'from-types': fromTypes.process,
};

const autocomplete = {
  'from-pokemon': fromPokemon.autocomplete,
  'from-types': fromTypes.autocomplete,
};

module.exports = {
  definition,
  command: {
    'from-pokemon': fromPokemon.command,
    'from-types': fromTypes.command,
  }
};

