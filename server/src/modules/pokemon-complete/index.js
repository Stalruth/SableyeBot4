import Sim from '@pkmn/sim';
import Data from '@pkmn/data';
import { InteractionResponseType } from 'discord-interactions';

import gens from 'gen-db';
import getargs from 'discord-getarg';

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
  get ['attacks']() {
    delete graphs['attacks'];
    return graphs['attacks'] = Array.from(gens.data['natdex']['moves'])
      .filter(e=>e.category !== 'Status')
      .map(e=>e.id)
      .sort();
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
        .reduce((acc, cur)=>[
          ...acc,
          cur.id,
          ...(cur.cosmeticFormes?.map(Data.toID) ?? [])
        ], [])
        .sort();
    return graphs['sprites'] = graph;
  },
};

function getMatcher(graphType, effectType) {
  function getMatches(query) {
    const id = Data.toID(query);
    return graphs[graphType]
        .filter(e=>e.includes(id))
        .map((e,i) => {
          return {
            name: gens.data['natdex'][effectType ?? graphType].get(e).name,
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
const getAttackMatches = getMatcher('attacks', 'moves');
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

function getCompleter(matchers, matchCount=25) {
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

function getMultiComplete(resolver, completer, {canNegate, canRepeat}) {
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

    const results = completer(currentTerm)
      .filter(choice => (resolved.every(e => e.value !== `${negated}${choice.value}`) || canRepeat))

    if (results.length !== 1) {
      return results.map(choice => ({
        name: `${prefix.name}${negated}${choice.name}`,
        value: `${prefix.value}${negated}${choice.value}`
      }));
    } else {
      return [
        {
          name: `${prefix.name}${negated}${results[0].name}`,
          value:`${prefix.value}${negated}${results[0].value}`,
        },
        ...completer('')
        .filter(choice => ([results[0], ...resolved].every(e => e.value !== `${negated}${choice.value}`) || canRepeat))
        .map(
          choice => ({
            name: `${results[0]['name']}, ${choice.name}`,
            value: `${results[0]['value']},${choice.value}`,
          })
        )].slice(0,25);
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

const completeAbility = getCompleter([getAbilityMatches]);
const completeMove = getCompleter([getMoveMatches]);
const completeAttack = getCompleter([getAttackMatches]);
const completeItem = getCompleter([getItemMatches]);
const completePokemon = getCompleter([getPokemonMatches]);
const completeType = getCompleter([getTypeMatches]);
const completeSprite = getCompleter([getSpriteMatches]);
const completeAll = getCompleter([getAbilityMatches, getMoveMatches, getItemMatches, getNatureMatches, getPokemonMatches]);

export {
  graphs,
  completeAbility,
  completeMove,
  completeAttack,
  completeItem,
  completePokemon,
  completeType,
  completeSprite,
  completeAll,
  getMultiComplete,
  getAutocompleteHandler,
};

