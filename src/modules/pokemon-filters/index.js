const Data = require('@pkmn/data');

const damageTaken = require('typecheck');
const fastMoves = require('fast-moves');

function getStat(pokemon, stat) {
  if(['bst', 'heightm', 'weightkg'].includes(stat)) {
    return pokemon[stat];
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
  weightkg: {
    fullName: 'Weight',
    article: 'a',
    suffix: 'stat ',
  },
  heightm: {
    fullName: 'Height',
    article: 'a',
    suffix: 'stat ',
  },
};

function statFilterFactory(stat) {
  return (data, query, isVgc) => {
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
        packed: query,
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
          packed: query,
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
          packed: query,
        };
      }
      if(operator === '<') {
        return {
          id: stat,
          description: `Has ${statData[stat].article} ${statData[stat].fullName} ${statData[stat].suffix}lower than ${compValue}`,
          predicate: (pokemon) => {
            return getStat(pokemon, stat) < compValue;
          },
          packed: query,
        };
      }
      throw query;
    }
    throw query;
  };
}

const filterFactory = {
  ability: (data, abilityId, isVgc) => {
    const ability = data.abilities.get(Data.toID(abilityId));
    if(!ability?.exists) {
      throw abilityId;
    }

    return {
      id: 'ability',
      description: `Has the ability ${ability['name']}`,
      predicate: (pokemon) => {
        return ['0','1','H'].some(slot=>pokemon['abilities'][slot] === ability['name'])
      },
      packed: ability['id'],
    };
  },
  type: (data, typeId, isVgc) => {
    const type = data.types.get(Data.toID(typeId));
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
        packed: `!${type['id']}`,
      };
    } else {
      return {
        id: 'type',
        description: `Is ${type['name']}-type`,
        predicate: (pokemon) => {
          return pokemon['types'].some(el=>el===type['name']);
        },
        packed: type['id'],
      };
    }
  },
  move: (data, moveId, isVgc) => {
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
        if(data.national) {
          return fastMoves.natdex[move.id][pokemon.id];
        }
        if(isVgc) {
          return fastMoves[restrictions[data.num]][move.id][pokemon.id];
        }
        return fastMoves[data.num][move.id][pokemon.id];
      },
      packed: move['id'],
    };
  },
  hp: statFilterFactory('hp'),
  atk: statFilterFactory('atk'),
  def: statFilterFactory('def'),
  spa: statFilterFactory('spa'),
  spd: statFilterFactory('spd'),
  spe: statFilterFactory('spe'),
  bst: statFilterFactory('bst'),
  weightkg: statFilterFactory('weightkg'),
  heightm: statFilterFactory('heightm'),
  weakness: (data, typeId, isVgc) => {
    const type = data.types.get(Data.toID(typeId));
    if(!type) {
      throw typeId;
    }

    return {
      id: 'weakness',
      description: `Is weak to ${type.name}`,
      predicate: (pokemon) => {
        return damageTaken(data, pokemon.types, type.id) > 1;
      },
      packed: type['id'],
    };
  },
  resist: (data, typeId, isVgc) => {
    const type = data.types.get(Data.toID(typeId));
    if(!type) {
      throw typeId;
    }

    return {
      id: 'resist',
      description: `Resists ${type.name}`,
      predicate: (pokemon) => {
        return damageTaken(data, pokemon.types, type.id) < 1;
      },
      packed: type['id']
    };
  },
  egggroup: (data, eggGroup, isVgc) => {
    return {
      id: 'egggroup',
      description: `Is in the ${eggGroup} egg group`,
      predicate: (pokemon) => {
        return pokemon['eggGroups'].some(e=>e===eggGroup);
      },
      packed: eggGroup,
    };
  },
  evolves: (data, arg, isVgc) => {
    const value = ['t', true].includes(arg);
    return {
      id: 'evolves',
      description: `${value ? 'Has' : 'Does not have'} an evolution.`,
      predicate: (pokemon) => {
        return !!pokemon['evos'] === value;
      },
      packed: value ? 't' : 'f',
    };
  },
  hasevolved: (data, arg, isVgc) => {
    const value = ['t', true].includes(arg);
    return {
      id: 'hasevolved',
      description: `${value ? 'Has' : 'Does not have'} a pre-evolution.`,
      predicate: (pokemon) => {
        return !!pokemon['prevo'] === value;
      },
      packed: value ? 't' : 'f',
    };
  }
};

async function applyFilters(pokemon, filters, threshold) {
  return (await Promise.all(pokemon.map(async (candidate) => {
    let score = 0;

    score = (await Promise.all(filters.map(async (filter)=> {
      return (await filter.predicate(candidate)) ? 1 : 0;
    }))).reduce((acc, cur) => {return acc + cur;}, 0);

    return score >= threshold ? candidate : undefined;
  }))).filter(el=>!!el);
}

function packFilters(filters) {
  return filters.reduce((acc, cur) => {
    return `${acc}|${cur.id}:${cur.packed}`;
  }, '');
}

module.exports = { filterFactory, applyFilters, packFilters };
