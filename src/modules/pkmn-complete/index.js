'use strict';

const Sim = require('@pkmn/sim');
const Data = require('@pkmn/data');

const toArray = require('dexdata-toarray');
const gens = require('gen-db');

function graphGetter(type) {
  const graph = toArray(gens.data['gen8natdex'][type])
      .map(e=>e.id)
      .sort();
  return graph;
}

const graphs = {
  get ['abilities']() {
    delete graphs['abilities'];
    return graphs['abilities'] = graphGetter('abilities');
  },
  get ['moves']() {
    delete graphs['moves'];
    return graphs['moves'] = graphGetter('moves');
  },
  get ['items']() {
    delete graphs['items'];
    return graphs['items'] = graphGetter('items');
  },
  get ['natures']() {
    delete graphs['natures'];
    return graphs['natures'] = graphGetter('natures');
  },
  get ['species']() {
    delete graphs['species'];
    return graphs['species'] = graphGetter('species');
  },
  get ['types']() {
    delete graphs['types'];
    return graphs['types'] = graphGetter('types');
  },
  // this one's built different
  get ['sprites']() {
    delete graphs['sprites'];
    const graph = Sim.Dex.species.all()
        .filter(el=>!['Custom','CAP'].includes(el.isNonstandard))
        .map(el=>el.id)
        .sort()
    return graphs['sprites'] = graph;
  },
};

function complete(type) {
  function completeEntity(id) {
    console.log('completing ' + type);
    return graphs[type]
        .filter(e=>e.startsWith(id))
        .slice(0,10)
        .map((e,i) => {
          return {
            name: gens.data['gen8natdex'][type].get(e).name,
            value: e,
          };
        });
  }
  return completeEntity;
}

const completeAbility = complete('abilities');
const completeMove = complete('moves');
const completeItem = complete('items');
const completeNature = complete('natures');
const completePokemon = complete('species');

function completeFilterType(id) {
  const negate = id.startsWith('!') ? '!' : '';
  return graphs.types
      .startsWith(Data.toID(id))
      .map((e,i) => {
        return {
          name: `${negate}${gens.data['gen8natdex'].types.get(e).name}`,
          value: `${negate}${e}`,
        };
      });
}

function completeSprite(id) {
  return graphs.sprites
      .filter(e=>e.startsWith(id))
      .slice(0,10)
      .map((e,i)=>{
        return {
          name: Sim.Dex.species.get(e).name,
          value: e,
        };
      });
}

function completeAll(id) {
  const realId = Data.toID(id);
  return [...new Set([
      ...completeAbility(realId),
      ...completeMove(realId),
      ...completeItem(realId),
      ...completeNature(realId),
      ...completePokemon(realId)
  ])].sort((lhs, rhs) => {
    if(lhs.value < rhs.value) return -1;
    if(lhs.value > rhs.value) return 1;
    return 0;
  }).slice(0,10);
}

module.exports = {
  completeAbility,
  completeMove,
  completeItem,
  completePokemon,
  completeType: complete('types'),
  completeFilterType,
  completeSprite,
  completeAll,
};

