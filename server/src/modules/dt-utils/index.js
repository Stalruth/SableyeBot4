import abilityInfo from './abilityInfo.js';
import itemInfo from './itemInfo.js';
import moveInfo from './moveInfo.js';
import natureInfo from './natureInfo.js';
import pokemonInfo from './pokemonInfo.js';

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

export { dt, getData };

