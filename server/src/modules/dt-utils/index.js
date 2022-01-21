'use strict';

const abilityInfo = require('./abilityInfo.js');
const itemInfo = require('./itemInfo.js');
const moveInfo = require('./moveInfo.js');
const natureInfo = require('./natureInfo.js');
const pokemonInfo = require('./pokemonInfo.js');

const dt = {
  Ability: abilityInfo,
  Item: itemInfo,
  Move: moveInfo,
  Nature: natureInfo,
  Pokemon: pokemonInfo,
};

function getData(data, id) {
  const results = [
    data.abilities.get(id),
    data.items.get(id),
    data.moves.get(id),
    data.natures.get(id),
    data.species.get(id),
  ].filter(e=>!!e);

  return results;
}

module.exports = { dt, getData };

