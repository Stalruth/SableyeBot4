'use strict';

const Dex = require('@pkmn/dex');
const Data = require('@pkmn/data');

const dataSearch = require('datasearch');
const { hasMove } = require('learnsetutils');

const command = {
  description: 'Get all Pokémon fitting the given conditions.',
  options: [
    {
      name: 'ability',
      type: 'STRING',
      description: 'Comma delimited list of Abilities.',
    },
    {
      name: 'types',
      type: 'STRING',
      description: 'Comma delimited list of types. Prefix a type with `!` to negate.',
    },
    {
      name: 'moves',
      type: 'STRING',
      description: 'Comma delimited list of moves.',
    },
    {
      name: 'hp',
      type: 'STRING',
      description: "Base HP, supports `<STAT`, `>STAT`, `STAT-STAT`",
    },
    {
      name: 'atk',
      type: 'STRING',
      description: "Base Attack, supports `<STAT`, `>STAT`, `STAT-STAT`",
    },
    {
      name: 'def',
      type: 'STRING',
      description: "Base Defence, supports `<STAT`, `>STAT`, `STAT-STAT`",
    },
    {
      name: 'spa',
      type: 'STRING',
      description: "Base Special Attack, supports `<STAT`, `>STAT`, `STAT-STAT`",
    },
    {
      name: 'spd',
      type: 'STRING',
      description: "Base Special Defence, supports `<STAT`, `>STAT`, `STAT-STAT`",
    },
    {
      name: 'spe',
      type: 'STRING',
      description: "Base Speed, supports `<STAT`, `>STAT`, `STAT-STAT`",
    },
    {
      name: 'bst',
      type: 'STRING',
      description: "Base Stat Total, supports `<STAT`, `>STAT`, `STAT-STAT`",
    },
    {
      name: 'weight-kg',
      type: 'STRING',
      description: "Weight in kg, supports `<STAT`, `>STAT`, `STAT-STAT`",
    },
    {
      name: 'egg-group',
      type: 'STRING',
      description: 'Egg Group the Pokémon is in.',
      choices: [
        {
          name: 'Amorphous',
          value: 'Amorphous',
        },
        {
          name: 'Bug',
          value: 'Bug',
        },
        {
          name: 'Dragon',
          value: 'Dragon',
        },
        {
          name: 'Ditto',
          value: 'Ditto',
        },
        {
          name: 'Fairy',
          value: 'Fairy',
        },
        {
          name: 'Field',
          value: 'Field',
        },
        {
          name: 'Flying',
          value: 'Flying',
        },
        {
          name: 'Grass',
          value: 'Grass',
        },
        {
          name: 'Human-Like',
          value: 'Human-Like',
        },
        {
          name: 'Mineral',
          value: 'Mineral',
        },
        {
          name: 'Monster',
          value: 'Monster',
        },
        {
          name: 'Undiscovered',
          value: 'Undiscovered',
        },
        {
          name: 'Water 1',
          value: 'Water 1',
        },
        {
          name: 'Water 2',
          value: 'Water 2',
        },
        {
          name: 'Water 3',
          value: 'Water 3',
        },
      ],
    },
    {
      name: 'threshold',
      type: 'INTEGER',
      description: 'Amount of filters that must match. Comma-separated fields count one for each item.',
    },
    {
      name: 'gen',
      type: 'INTEGER',
      description: 'The Generation used in calculation',
      choices: [
        {
          name: 'RBY',
          value: 1,
        },
        {
          name: 'GSC',
          value: 2,
        },
        {
          name: 'RSE',
          value: 3,
        },
        {
          name: 'DPPt/HGSS',
          value: 4,
        },
        {
          name: 'BW/BW2',
          value: 5,
        },
        {
          name: 'XY/ORAS',
          value: 6,
        },
        {
          name: 'SM/USM',
          value: 7,
        },
        {
          name: 'SwSh',
          value: 8,
        },
      ]
    },
    {
      name: 'mode',
      type: 'STRING',
      description: 'Limit search to current generation.',
      choices: [
        {
          name: 'VGC',
          value: 'vgc',
        },
        {
          name: 'Default',
          value: 'default',
        },
      ],
    },
  ],
};

const getStat = (pokemon, stat) => {
  if(stat === 'weightkg') {
    return pokemon[stat];
  }
  if(stat === 'bst') {
    const s = pokemon['baseStats'];
    return s.hp + s.atk + s.def + s.spa + s.spd + s.spe;
  } else {
    return pokemon['baseStats'][stat];
  }
};

const statFilterFactory = (stat) => {
  const statNames = {
    hp: 'HP',
    atk: 'Attack',
    def: 'Defence',
    spa: 'Special Attack',
    spd: 'Special Defence',
    spe: 'Speed',
    bst: 'Base Stat Total',
    weightkg: 'Weight',
  };
  const getArticle = (stat) => {
    return stat === 'hp' || stat === 'atk' ? 'an' : 'a';
  };
  const getSuffix = (stat) => {
    return stat === 'bst' || stat === 'weightkg' ? '' : 'stat '
  }
  return (query) => {
    if(!isNaN(Number(query))) {
      return {
        description: `Has ${getArticle(stat)} ${statNames[stat]} ${getSuffix(stat)}of ${Number(query)}`,
        predicate: (pokemon) => {
          if(getStat(pokemon.species, stat) === Number(query)) {
            return {species: pokemon.species, matches: pokemon.matches + 1};
          } else {
            return pokemon;
          }
        }
      };
    }
    const compValue = Number(query.substr(1));
    if(!isNaN(compValue)) {
      const operator = query[0];
      if(operator === '>') {
        return {
          description: `Has ${getArticle(stat)} ${statNames[stat]} ${getSuffix(stat)}greater than ${compValue}`,
          predicate: (pokemon) => {
            if(getStat(pokemon.species, stat) > compValue) {
              return {species: pokemon.species, matches: pokemon.matches + 1};
            } else {
              return pokemon;
            }
          }
        };
      }
      if(operator === '<') {
        return {
          description: `Has ${getArticle(stat)} ${statNames[stat]} ${getSuffix(stat)}lower than ${compValue}`,
          predicate: (pokemon) => {
            if(getStat(pokemon.species, stat) < compValue) {
              return {species: pokemon.species, matches: pokemon.matches + 1};
            } else {
              return pokemon;
            }
          }
        };
      }
      throw query;
    }
    const range = query.split('-').map(e=>Number(e));
    if(range.length === 2 && !range.some(e=>isNaN(e)) && range[0] < range[1]) {
      return {
        description: `Has ${getArticle(stat)} ${statNames[stat]} ${getSuffix(stat)}between ${range[0]} and ${range[1]}`,
        predicate: (pokemon) => {
          if(getStat(pokemon.species, stat) >= range[0] && getStat(pokemon.species, stat) <= range[1]) {
            return {species: pokemon.species, matches: pokemon.matches + 1};
          } else {
            return pokemon;
          }
        }
      };
    }
    throw query;
  };
}

const filterFactory = {
  ability: (data, abilityId) => {
    const ability = dataSearch(data.abilities, Data.toID(abilityId))?.result;
    if(!ability) {
      throw abilityId;
    }

    return {
      description: `Has the ability ${ability['name']}`,
      predicate: (pokemon) => {
        if(['0','1','H'].some(slot=>pokemon.species['abilities'][slot] === ability['name'])) {
          return {species: pokemon.species, matches: pokemon.matches + 1};
        } else {
          return pokemon;
        }
      },
    };
  },
  type: (data, typeId) => {
    const type = dataSearch(data.types, Data.toID(typeId))?.result;
    if(!type) {
      throw typeId;
    }

    if(typeId.startsWith('!')) {
      return {
        description: `Is not ${type['name']}-type`,
        predicate: (pokemon) => {
          if(!(pokemon.species['types'].some(el=>el===type['name']))) {
            return {species: pokemon.species, matches: pokemon.matches + 1};
          } else {
            return pokemon;
          };
        },
      };
    } else {
      return {
        description: `Is ${type['name']}-type`,
        predicate: (pokemon) => {
          if(pokemon.species['types'].some(el=>el===type['name'])) {
            return {species: pokemon.species, matches: pokemon.matches + 1};
          } else {
            return pokemon;
          }
        },
      };
    }
  },
  move: (data, moveId, vgc) => {
    const move = dataSearch(data.moves, Data.toID(moveId))?.result;
    if(!move) {
      throw moveId;
    }

    return {
      async: true,
      description: `Has the move ${move['name']}`,
      predicate: async (pokemon) => {
        if(await hasMove(data, pokemon.species, move, vgc)) {
          return {species: pokemon.species, matches: pokemon.matches + 1};
        } else {
          return pokemon;
        }
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
  weightkg: statFilterFactory('weightkg'),
  egggroup: (eggGroup) => {
    return {
      description: `Is in the ${eggGroup} egg group`,
      predicate: (pokemon) => {
        return pokemon['eggGroups'].some(e=>e===eggGroup);
      },
    };
  },
};

const toArray = (data) => {
  const results = [];
  for(const i of data){
    results.push(i);
  }
  return results;
}

const process = async function(interaction) {
  const args = {
    ability: interaction.options.getString('ability') ?? undefined,
    type: interaction.options.getString('types') ?? undefined,
    move: interaction.options.getString('moves') ?? undefined,
    hp: interaction.options.getString('hp') ?? undefined,
    atk: interaction.options.getString('atk') ?? undefined,
    def: interaction.options.getString('def') ?? undefined,
    spa: interaction.options.getString('spa') ?? undefined,
    spa: interaction.options.getString('spd') ?? undefined,
    spe: interaction.options.getString('spe') ?? undefined,
    bst: interaction.options.getString('bst') ?? undefined,
    weightkg: interaction.options.getString('weight-kg') ?? undefined,
    egggroup: interaction.options.getString('egg-group') ?? undefined,
  };
  const isVgc = interaction.options.getInteger('vgc') === 'vgc';
  const gen = interaction.options.getInteger('gen') ?? Dex.Dex.gen;

  const data = new Data.Generations(Dex.Dex).get(gen);
  const filters = [];

  if(args['ability']) {
    const abilities = args['ability'].split(',');
    for(const ability of abilities) {
      try {
        const filter = filterFactory['ability'](data, ability);
        filters.push(filter);
      } catch {
        interaction.editReply(`The ability ${ability} could not be found in Generation ${gen}.`);
        return;
      }
    }
  }

  if(args['type']) {
    const types = args['type'].split(',');
    for(const type of types) {
      try {
        const filter = filterFactory['type'](data, type);
        filters.push(filter);
      } catch {
        interaction.editReply(`The type ${type} could not be found in Generation ${gen}.`);
        return;
      }
    }
  }

  if(args['move']) {
    const moves = args['move'].split(',');
    for(const move of moves) {
      try {
        const filter = filterFactory['move'](data, move, isVgc);
        filters.push(filter);
      } catch {
        console.log
        interaction.editReply(`The move ${move} could not be found in Generation ${gen}.`);
        return;
      }
    }
  }

  for (const stat of ['hp','atk','def','spa','spd','spe','bst','weightkg']) {
    if(args[stat]) {
      try {
        const filter = filterFactory[stat](args[stat]);
        filters.push(filter);
      } catch(e) {
        console.log(e);
        interaction.editReply(`The query ${args[stat]} is not valid for the '${stat}' argument.`);
        return;
      }
    }
  }

  if(args['egggroup']) {
    filters.push(filterFactory['egggroup'](args['egggroup']));
  }

  if(filters.length === 0) {
    interaction.editReply('You haven\'t added any filters.');
    return;
  }

  const threshold = Math.min(interaction.options.getInteger('threshold') ?? Infinity, filters.length);

  let results = toArray(data.species).map(el=>{return {species:el,matches:0};});

  for(const filter of filters) {
    if(filter.async) {
      results = await Promise.all(results.map(filter.predicate));
    } else {
      results = results.map(filter.predicate);
    }
  }

  results = results.filter(el=>el.matches === threshold);

  const filterDescriptions = filters.map(el=>`- ${el['description']}`).join('\n');

  const thresholdDescription = threshold !== filters.length ? ` (${threshold} must match)` : '';

  const replies = [`Filters${thresholdDescription}:\n${filterDescriptions}\n- - -\nResults (${results.length}):\n`];

  results.forEach((result, index, array)=>{
    const resultAppend = result.species['name'] + ((index === array.length - 1) ? '' : ', ');
    if(replies[replies.length - 1].length + resultAppend.length > 2000) {
      replies.push('');
    }
    replies[replies.length - 1] += resultAppend;
  });

  await interaction.editReply(replies[0]);

  replies.forEach((reply, index)=>{if(index != 0) {interaction.followUp(reply)}});
};

module.exports = {command, process};

