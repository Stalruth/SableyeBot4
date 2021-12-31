'use strict';
console.time('loadFilters');

const Data = require('@pkmn/data');console.timeLog('loadFilters');
const toArray = require('dexdata-toarray'); console.timeLog('loadFilters');
const genDb = require('gen-db'); console.timeLog('loadFilters');
const damageTaken = require('typecheck'); console.timeLog('loadFilters');

console.timeEnd('loadFilters');

const genData = genDb.data;

function getStat(pokemon, stat) {
  if (stat === 'bst') {
    return pokemon[stat];
  } else if (stat === 'height-m') {
    return pokemon['heightm'];
  } else if (stat === 'weight-kg') {
    return pokemon['weightkg'];
  } else {
    return pokemon['baseStats'][stat];
  }
}

const statData = {
  hp: {
    fullName: 'HP',
    article: 'an',
    suffix: 'stat ',
  },
  atk: {
    fullName: 'Attack',
    article: 'an',
    suffix: 'stat ',
  },
  def: {
    fullName: 'Defence',
    article: 'a',
    suffix: 'stat ',
  },
  spa: {
    fullName: 'Special Attack',
    article: 'a',
    suffix: 'stat ',
  },
  spd: {
    fullName: 'Special Defence',
    article: 'a',
    suffix: 'stat ',
  },
  spe: {
    fullName: 'Speed',
    article: 'a',
    suffix: 'stat ',
  },
  bst: {
    fullName: 'Base Stat Total',
    article: 'a',
    suffix: 'stat ',
  },
  'weight-kg': {
    fullName: 'Weight (kg)',
    article: 'a',
    suffix: 'stat ',
  },
  'height-m': {
    fullName: 'Height (m)',
    article: 'a',
    suffix: 'stat ',
  },
};

function statFilterFactory(stat) {
  return (dataSet, query, isVgc) => {
    function pack() {
      return `${query}`;
    }
    if(!isNaN(Number(query))) {
      return {
        id: stat,
        description: `Has ${statData[stat].article} ${statData[stat].fullName} ${statData[stat].suffix}of ${Number(query)}`,
        predicate: (pokemon) => {
          return getStat(pokemon, stat) === Number(query);
        },
      };
    }
    if(query.indexOf('-') !== -1) {
      const range = query.split('-').map(e=>Number(e));
      if(range.length === 2 && !range.some(e=>isNaN(e)) && range[0] < range[1]) {
        return {
          id: stat,
          description: `Has ${statData[stat].article} ${statData[stat].fullName} ${statData[stat].suffix}between ${range[0]} and ${range[1]}`,
          predicate: (pokemon) => {
            return getStat(pokemon, stat) >= range[0] && getStat(pokemon, stat) <= range[1];
          },
        };
      }
    }
    const compValue = Number(query.substr(1));
    if(!isNaN(compValue)) {
      const operator = query[0];
      if(operator === '>') {
        return {
          id: stat,
          description: `Has ${statData[stat].article} ${statData[stat].fullName} ${statData[stat].suffix}greater than ${compValue}`,
          predicate: (pokemon) => {
            return getStat(pokemon, stat) > compValue;
          },
        };
      }
      if(operator === '<') {
        return {
          id: stat,
          description: `Has ${statData[stat].article} ${statData[stat].fullName} ${statData[stat].suffix}lower than ${compValue}`,
          predicate: (pokemon) => {
            return getStat(pokemon, stat) < compValue;
          },
        };
      }
      throw query;
    }
    throw query;
  };
}

const filterFactory = {
  ability: (dataSet, abilityId, isVgc) => {
    const ability = genData[dataSet].abilities.get(Data.toID(abilityId));
    if(!ability?.exists) {
      throw abilityId;
    }

    return {
      id: 'ability',
      description: `Has the ability ${ability['name']}`,
      predicate: (pokemon) => {
        return ['0','1','H'].some(slot=>pokemon['abilities'][slot] === ability['name'])
      },
    };
  },
  type: (dataSet, typeId, isVgc) => {
    const type = genData[dataSet].types.get(Data.toID(typeId));
    if(!type?.exists) {
      throw typeId;
    }

    if(typeId.startsWith('!')) {
      return {
        id: 'type',
        description: `Is not ${type['name']}-type`,
        predicate: (pokemon) => {
          return !(pokemon['types'].some(el=>el===type['name']));
        },
      };
    } else {
      return {
        id: 'type',
        description: `Is ${type['name']}-type`,
        predicate: (pokemon) => {
          return pokemon['types'].some(el=>el===type['name']);
        },
      };
    }
  },
  move: (dataSet, moveId, isVgc) => {
    const fastMoves = require('fast-moves');

    const data = genData[dataSet];
    const move = data.moves.get(Data.toID(moveId));  
    if(!move) {
      throw moveId;
    }

    const restrictions = {
      6: 'Pentagon',
      7: 'Plus',
      8: 'Galar',
    };

    return {
      async: true,
      id: 'move',
      description: `Has the move ${move['name']}`,
      predicate: async (pokemon) => {
        const modId = isVgc ? restrictions[data.num] : dataSet;
        return fastMoves[modId][move.id][pokemon.id];
      },
    };
  },
  hp: statFilterFactory('hp'),
  atk: statFilterFactory('atk'),
  def: statFilterFactory('def'),
  spa: statFilterFactory('spa'),
  spd: statFilterFactory('spd'),
  spe: statFilterFactory('spe'),
  bst: statFilterFactory('bst'),
  'weight-kg': statFilterFactory('weight-kg'),
  'height-m': statFilterFactory('height-m'),
  weakness: (dataSet, typeId, isVgc) => {
    const type = genData[dataSet].types.get(Data.toID(typeId));
    if(!type) {
      throw typeId;
    }

    return {
      id: 'weakness',
      description: `Is weak to ${type.name}`,
      predicate: (pokemon) => {
        return damageTaken(genData[dataSet], pokemon.types, type.id) > 1;
      },
    };
  },
  resist: (dataSet, typeId, isVgc) => {
    const type = genData[dataSet].types.get(Data.toID(typeId));
    if(!type) {
      throw typeId;
    }

    return {
      id: 'resist',
      description: `Resists ${type.name}`,
      predicate: (pokemon) => {
        return damageTaken(genData[dataSet], pokemon.types, type.id) < 1;
      },
    };
  },
  'egg-group': (dataSet, eggGroup, isVgc) => {
    return {
      id: 'egggroup',
      description: `Is in the ${eggGroup} egg group`,
      predicate: (pokemon) => {
        return pokemon['eggGroups'].some(e=>e===eggGroup);
      },
    };
  },
  evolves: (dataSet, arg, isVgc) => {
    const value = ['t', true].includes(arg);
    return {
      id: 'evolves',
      description: `${value ? 'Has' : 'Does not have'} an evolution.`,
      predicate: (pokemon) => {
        return !!pokemon['evos'] === value;
      },
    };
  },
  'has-evolved': (dataSet, arg, isVgc) => {
    const value = ['t', true].includes(arg);
    return {
      id: 'hasevolved',
      description: `${value ? 'Has' : 'Does not have'} a pre-evolution.`,
      predicate: (pokemon) => {
        return !!pokemon['prevo'] === value;
      },
    };
  }
};

async function applyFilters(genName, filters, threshold) {
  return (await Promise.all(toArray(genData[genName].species).map(async (candidate) => {
    let score = 0;

    score = (await Promise.all(filters.map(async (filter)=> {
      return (await filter.predicate(candidate)) ? 1 : 0;
    }))).reduce((acc, cur) => {return acc + cur;}, 0);

    return score >= threshold ? candidate : undefined;
  }))).filter(el=>!!el);
}

module.exports = { filterFactory, applyFilters };
