import genDb from 'gen-db';

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
          description: `Has ${statData[stat].article} ${statData[stat].fullName} ${statData[stat].suffix}greater than ${compValue}`,
          predicate: (pokemon) => {
            return getStat(pokemon, stat) > compValue;
          },
        };
      }
      if(operator === '<') {
        return {
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
    const ability = genData[dataSet].abilities.get(abilityId);
    if(!ability?.exists) {
      throw abilityId;
    }

    return {
      description: `Has the ability ${ability['name']}`,
      predicate: (pokemon) => {
        return ['0','1','H'].some(slot=>pokemon['abilities'][slot] === ability['name'])
      },
    };
  },
  type: (dataSet, typeId, isVgc) => {
    const type = genData[dataSet].types.get(typeId);
    if(!type?.exists) {
      throw typeId;
    }

    if(typeId.trim()[0] === '!') {
      return {
        description: `Is not ${type['name']}-type`,
        predicate: (pokemon) => {
          return !(pokemon['types'].some(el=>el===type['name']));
        },
      };
    } else {
      return {
        description: `Is ${type['name']}-type`,
        predicate: (pokemon) => {
          return pokemon['types'].some(el=>el===type['name']);
        },
      };
    }
  },
  move: (dataSet, moveId, isVgc) => {
    const data = genData[dataSet];
    const move = data.moves.get(moveId);
    if(!move) {
      throw moveId;
    }

    if(moveId.trim()[0] === '!') {
      return {
        async: true,
        description: `Does not learn ${move['name']}`,
        predicate: async (pokemon) => {
          const sources = [];
          for await (const l of data.learnsets.all(pokemon)) {
            sources.push(l.learnset?.[move.id]);
          }
          return sources
            .flat()
            .filter(source => !!source)
            .filter(source => !isVgc || (source.startsWith(String(data.num)) && !source.endsWith('V')))
            .length === 0;
        },
      };
    }

    return {
      async: true,
      description: `Learns ${move['name']}`,
      predicate: async (pokemon) => {
        const sources = [];
        for await (const l of data.learnsets.all(pokemon)) {
          sources.push(l.learnset?.[move.id]);
        }
        return sources
          .flat()
          .filter(source => !!source)
          .filter(source => !isVgc || (source.startsWith(String(data.num)) && !source.endsWith('V')))
          .length > 0;
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
    const type = genData[dataSet].types.get(typeId);
    if(!type) {
      throw typeId;
    }

    return {
      description: `Is weak to ${type.name}`,
      predicate: (pokemon) => {
        return type.totalEffectiveness(pokemon.types) > 1;
      },
    };
  },
  resist: (dataSet, typeId, isVgc) => {
    const type = genData[dataSet].types.get(typeId);
    if(!type) {
      throw typeId;
    }

    return {
      description: `Resists ${type.name}`,
      predicate: (pokemon) => {
        return type.totalEffectiveness(pokemon.types) < 1;
      },
    };
  },
  'breeds-with': (dataSet, pokemonId, isVgc) => {
    const pokemon = genData[dataSet].species.get(pokemonId);
    if(!pokemon) {
      throw pokemonId;
    }

    const name = pokemon.name;
    const eggGroups = new Set(pokemon.eggGroups);

    return {
      description: `Can be bred with ${name} (${pokemon.eggGroups.join(', ')}).`,
      predicate: (candidate) => {
        if (candidate['eggGroups'].indexOf('Undiscovered') > -1 ||
          eggGroups.has('Undiscovered')) {
          return false;
        }

        if (candidate['eggGroups'].indexOf('Ditto') > -1 ||
          eggGroups.has('Ditto')) {
          return true;
        }

        if ((candidate.genderRatio.M === 0 && candidate.genderRatio.F === 0) ||
          (pokemon.genderRatio.M === 0 && pokemon.genderRatio.F === 0)) {
          return false;
        }

        return candidate['eggGroups'].some(e=>eggGroups.has(e));
      },
    };
  },
  'has-evo': (dataSet, arg, isVgc) => {
    const value = ['t', true].includes(arg);
    return {
      description: `${value ? 'Has' : 'Does not have'} an evolution.`,
      predicate: (pokemon) => {
        return !!pokemon['evos'] === value;
      },
    };
  },
  'has-prevo': (dataSet, arg, isVgc) => {
    const value = ['t', true].includes(arg);
    return {
      description: `${value ? 'Has' : 'Does not have'} a pre-evolution.`,
      predicate: (pokemon) => {
        return !!pokemon['prevo'] === value;
      },
    };
  },
  'vgc-legality': (dataSet, arg, isVgc) => {
    const descriptions = {
      'vgc': 'legal in most VGC formats',
      'gsc': 'legal in GS Cup formats',
      'gsc-restricted': 'restricted to 2 per team in GS Cup formats',
      'banned': 'always banned in VGC formats',
    };

    return {
      description: `Is ${descriptions[arg]}`,
      predicate: (pokemon) => {
        if(pokemon.tags[0] === 'Restricted Legendary') {
          return arg === 'gsc' || arg === 'gsc-restricted';
        }
        if(pokemon.tags[0] === 'Mythical') {
          return arg === 'banned';
        }
        else {
          return arg === 'vgc' || arg === 'gsc';
        }
      },
    }
  },
};

async function applyFilters(genName, filters, threshold) {
  return (await Promise.all(Array.from(genData[genName].species).map(async (candidate) => {
    let score = 0;

    score = (await Promise.all(filters.map(async (filter)=> {
      return (await filter.predicate(candidate)) ? 1 : 0;
    }))).reduce((acc, cur) => {return acc + cur;}, 0);

    return score >= threshold ? candidate : undefined;
  }))).filter(el=>!!el);
}

export { filterFactory, applyFilters };
