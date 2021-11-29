'use strict';

const Sim = require('@pkmn/sim');
const Data = require('@pkmn/data');
const WordGraphs = require('word-graphs');

const toArray = require('dexdata-toarray');
const gens = require('gen-db');

const graphs = {
  all: new WordGraphs.Trie(),
};

['abilities','moves','items','species','natures','types'].forEach(type=>{
  graphs[type] = new WordGraphs.MinimalWordGraph();
  toArray(gens.data['gen8natdex'][type])
      .map(e=>e.id)
      .sort()
      .forEach(el=>{
        graphs[type].add(el);
        if(['abilities','moves','items','species','natures'].includes(type)) {
          graphs.all.add(el);
        }
      });
});

graphs['sprites'] = new WordGraphs.MinimalWordGraph();
Sim.Dex.species.all()
              .filter(el=>!['Custom','CAP'].includes(el.isNonstandard))
              .map(el=>el.id)
              .sort()
              .forEach(el=>graphs['sprites'].add(el));

function complete(type) {
  function completeEntity(id) {
    return graphs[type].startsWith(Data.toID(id)).slice(0,25).map((e,i) => {
      return {
        name: gens.data['gen8natdex'][type].get(e).name,
        value: e,
      };
    });
  }
  return completeEntity;
}

function completeFilterType(id) {
  const negate = id.startsWith('!') ? '!' : '';
  return graphs.types.startsWith(Data.toID(id)).slice(0,25).map((e,i) => {
    return {
      name: `${negate}${gens.data['gen8natdex'].types.get(e).name}`,
      value: `${negate}${e}`,
    };
  });
}

function completeSprite(id) {
  return graphs['sprites'].startsWith(Data.toID(id)).slice(0,25).map((e,i)=>{
    return {
      name: Sim.Dex.species.get(e).name,
      value: e,
    };
  });
}

function completeAll(id) {
  return graphs.all
      .startsWith(Data.toID(id))
      .slice(0,25)
      .map(e => {
        const result = [
          gens.data['gen8natdex'].abilities.get(Data.toID(e)),
          gens.data['gen8natdex'].items.get(Data.toID(e)),
          gens.data['gen8natdex'].moves.get(Data.toID(e)),
          gens.data['gen8natdex'].natures.get(Data.toID(e)),
          gens.data['gen8natdex'].species.get(Data.toID(e)),
        ].filter(el=>!!el)[0];
        return {name: result.name, value: result.id};
      });
}

module.exports = {
  completeAbility: complete('abilities'),
  completeMove: complete('moves'),
  completeItem: complete('items'),
  completePokemon: complete('species'),
  completeType: complete('types'),
  completeFilterType,
  completeSprite,
  completeAll,
};

