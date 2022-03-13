'use strict';

const Sim = require('@pkmn/sim');
const Data = require('@pkmn/data');
const { InteractionResponseType } = require('discord-interactions');

const gens = require('gen-db');
const getargs = require('discord-getarg');

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
const getNatureMatches = getMatcher('natures', 25);
const getPokemonMatches = getMatcher('species');
const getTypeMatches = getMatcher('types', 25);

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

function getCompleter(matchers, matchCount=10) {
  return function completer(query) {
    return matchers
    .reduce((acc, cur) => {
      return [...acc, ...cur(query)];
    }, [])
    .sort(getMatchSorter(query))
    .filter((el,i,arr)=>(el.value!==arr[i-1]?.value))
    .slice(0, matchCount);
  }
}

function getMultiComplete(resolver, completer, canNegate) {
  return function multiCompleter(query) {
    const terms = query.split(',');
    const currentTerm = terms.pop();
    const resolved = terms.map(e=>{
      const effect = resolver.get(e);
      if (!effect) {
        return null;
      }
      const negated = (canNegate && e.trim()[0] === '!') ? '!' : '';
      return {
        name: `${negated}${effect.name}`,
        value: `${negated}${effect.id}`,
      };
    });

    if (resolved.some(e => !e)) {
      return [];
    }

    const prefix = resolved.reduce((acc, cur) => ({
      name: `${acc.name}${cur.name}, `,
      value: `${acc.value}${cur.value},`,
    }),{name: '', value: ''});

    const negated = (canNegate && currentTerm.trim()[0] === '!') ? '!' : '';

    const results = completer(currentTerm).map(choice => ({
      name: `${prefix.name}${negated}${choice.name}`,
      value: `${prefix.value}${negated}${choice.value}`
    }));

    if (results.length !== 1) {
      return results;
    } else {
      return [results[0], ...completer('').map(choice => ({
        name: `${results[0]['name']}, ${choice.name}`,
        value: `${results[0]['value']},${choice.value}`,
      }))];
    }
  };
}

function getAutocompleteHandler(completer, option) {
  return function(interaction) {
    const { params } = getargs(interaction);
    return {
      type: InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
      data: {
        choices: completer(params[option]),
      },
    };
  };
}

module.exports = {
  graphs,
  completeAbility: getCompleter([getAbilityMatches]),
  completeMove: getCompleter([getMoveMatches]),
  completeItem: getCompleter([getItemMatches]),
  completePokemon: getCompleter([getPokemonMatches]),
  completeType: getCompleter([getTypeMatches]),
  completeSprite: getCompleter([getSpriteMatches]),
  completeAll: getCompleter([getAbilityMatches, getMoveMatches, getItemMatches, getNatureMatches, getPokemonMatches]),
  getMultiComplete,
  getAutocompleteHandler,
};

