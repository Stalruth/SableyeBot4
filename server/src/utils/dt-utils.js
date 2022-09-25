import abilityInfo from './dt-layouts/ability.js';
import itemInfo from './dt-layouts/item.js';
import moveInfo from './dt-layouts/move.js';
import natureInfo from './dt-layouts/nature.js';
import pokemonInfo from './dt-layouts/pokemon.js';

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

