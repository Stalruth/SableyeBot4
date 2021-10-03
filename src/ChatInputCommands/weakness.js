const fromPokemon = require('./weakness/from-pokemon.js');
const fromTypes = require('./weakness/from-types.js');

const command = {
  description: 'Weaknesses based on a given Pokémon or types.',
  options: [
    Object.assign({
      name: 'from-pokemon',
      type: 1,
    }, fromPokemon.command),
    Object.assign({
      name: 'from-types',
      type: 1,
    }, fromTypes.command),
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

module.exports = {command, process, autocomplete};

