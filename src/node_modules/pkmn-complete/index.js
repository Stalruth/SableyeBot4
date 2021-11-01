'use strict';

const Data = require('@pkmn/data');
const Dex = require('@pkmn/dex');
const WordGraphs = require('word-graphs');

const toArray = require('dexdata-toarray');
const natDexData = require('natdexdata');

const graphs = {
  all: new WordGraphs.Trie(),
};

['abilities','moves','items','species','natures','types'].forEach(type=>{
  graphs[type] = new WordGraphs.MinimalWordGraph();
  toArray(natDexData[type])
      .map(e=>e.id)
      .sort()
      .forEach(el=>{
        graphs[type].add(el);
        if(['abilities','moves','items','species','natures'].includes(type)) {
          graphs.all.add(el);
        }
      });
});

function complete(type) {
  function completeEntity(id) {
    return graphs[type].startsWith(Data.toID(id)).slice(0,25).map((e,i) => {
      return {
        name: natDexData[type].get(e).name,
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
      name: `${negate}${natDexData.types.get(e).name}`,
      value: `${negate}${e}`,
    };
  });
}

function completeAll(id) {
  return graphs.all
      .startsWith(Data.toID(id))
      .slice(0,25)
      .map(e => {
        const result = [
          natDexData.abilities.get(Data.toID(e)),
          natDexData.items.get(Data.toID(e)),
          natDexData.moves.get(Data.toID(e)),
          natDexData.natures.get(Data.toID(e)),
          natDexData.species.get(Data.toID(e)),
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
  completeAll,
};

