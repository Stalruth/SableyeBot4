'use strict';

const Sim = require('@pkmn/sim');
const Data = require('@pkmn/data');

const gens = require('gen-db');

function graphGetter(type) {
  const graph = Array.from(gens.data['natdex'][type])
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

function getMatcher(type) {
  function getMatches(query) {
    const id = Data.toID(query);
    return graphs[type]
        .filter(e=>e.includes(id))
        .map((e,i) => {
          return {
            name: gens.data['natdex'][type].get(e).name,
            value: e,
          };
        });
  }
  return getMatches;
}

function getSpriteMatches(query) {
  return graphs.sprites
      .filter(e=>e.startsWith(Data.toID(query)))
      .map((e,i)=>{
        return {
          name: Sim.Dex.species.get(e).name,
          value: e,
        };
      });
}

const getAbilityMatches = getMatcher('abilities');
const getMoveMatches = getMatcher('moves');
const getItemMatches = getMatcher('items');
const getNatureMatches = getMatcher('natures');
const getPokemonMatches = getMatcher('species');
const getTypeMatches = getMatcher('types');

function getMatchSorter(query) {
  return function matchSorter(lhs, rhs) {
    const id = Data.toID(query);
    if(lhs.value.startsWith(id) && !rhs.value.startsWith(id)) {
      return -1;
    }
    if(rhs.value.startsWith(id) && !lhs.value.startsWith(id)) {
      return 1;
    }
    if(lhs.value < rhs.value) return -1;
    if(lhs.value > rhs.value) return 1;
    return 0;
  }
}

function completeFilterType(query) {
  const negate = query.trimStart().startsWith('!') ? '!' : '';
  return getTypeMatches(query)
      .sort(getMatchSorter(query))
      .map(e => {
        return {
          name: `${negate}${e.name}`,
          value: `${negate}${e.value}`,
        };
      });
}

function getCompleter(matchers) {
  return function completer(query) {
    return matchers
    .reduce((acc, cur) => {
      return [...acc, ...cur(query)];
    }, [])
    .sort(getMatchSorter(query))
    .filter((el,i,arr)=>(el.value!==arr[i-1]?.value))
    .slice(0, 10);
  }
}

module.exports = {
  graphs,
  completeAbility: getCompleter([getAbilityMatches]),
  completeMove: getCompleter([getMoveMatches]),
  completeItem: getCompleter([getItemMatches]),
  completePokemon: getCompleter([getPokemonMatches]),
  completeType: getCompleter([getTypeMatches]),
  completeFilterType,
  completeSprite: getCompleter([getSpriteMatches]),
  completeAll: getCompleter([getAbilityMatches, getMoveMatches, getItemMatches, getNatureMatches, getPokemonMatches]),
};

