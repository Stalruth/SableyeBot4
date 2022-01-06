'use strict';

const { InteractionResponseFlags } = require('discord-interactions');
const { toID } = require('@pkmn/data');

const buildEmbed = require('embed-builder');
const gens = require('gen-db');
const colours = require('pkmn-colours');

function lowKickPower(weight) {
  if(weight < 10) return 20;
  if(weight < 25) return 40;
  if(weight < 50) return 60;
  if(weight < 100) return 80;
  if(weight < 200) return 100;
}

function pokemonInfo(pokemon, gen, verbose) {
  let title = `No. ${pokemon['num']}: ${pokemon['name']}`;
  let description = `${pokemon['types'].join('/')} Type`;

  if(!gen < 3) {
    const abilities = [pokemon['abilities'][0]]
    if(pokemon['abilities'][1]) {
      abilities.push(pokemon['abilities'][1]);
    }
    if(pokemon['abilities']['H'] && !pokemon['unreleasedHidden']) {
      abilities.push(pokemon['abilities']['H'] + ' (Hidden)');
    }
    description += `\nAbilities: ${abilities.join(', ')}`;
  }

  const statNames = ['HP', 'Atk', 'Def', ...(gen <= 2 ? ['Spc'] : ['SpA', 'SpD']), 'Spe']
  const stats = [
    pokemon.baseStats.hp,
    pokemon.baseStats.atk,
    pokemon.baseStats.def,
    ...(gen === 1 ? [
      pokemon.baseStats.spa
    ] : [
      pokemon.baseStats.spa,
      pokemon.baseStats.spd
    ]),
    pokemon.baseStats.spe
  ];
  description += `\n${statNames.join('/')}: ${stats.join('/')} [BST: ${stats.reduce((ac, el) => ac + el)}]`;

  if(verbose) {
    description += `\nIntroduced: Generation ${pokemon['gen']}`;
    description += `\nWeight: ${pokemon['weightkg']}kg (${lowKickPower(pokemon['weightkg'])} BP); Height: ${pokemon['heightm']}m`;
  }

  if(pokemon['baseSpecies'] !== pokemon['name']) {
    description += `\nBase Species: ${pokemon['baseSpecies']}`;
  }

  if(pokemon['otherFormes']) {
    description += `\nOther Formes: ${pokemon['otherFormes'].join(', ')}`;
  }

  if(verbose) {
    if(pokemon['prevo']) {
      description += `\nPre-evolution: ${pokemon['prevo']}`;
    }
    if(pokemon['evos']) {
      description += `\nEvolution(s): ${pokemon['evos'].join(', ')}`;
    }
    description += `\nEgg Groups: ${pokemon['eggGroups']}`;

    description += `\nGender Ratio: `
    const genderRatio = {
      'M': pokemon['genderRatio']['M'] * 100,
      'F': pokemon['genderRatio']['F'] * 100,
      'N': pokemon['genderRatio']['M'] + pokemon['genderRatio']['F'] === 0 ? 100 : 0
    };
    let ratios = [];
    ['M','F','N'].forEach((el) => {
      if(genderRatio[el] > 0) {
        ratios.push(`${el}: ${genderRatio[el]}%`);
      }
    });
    description += ratios.join(', ');

    if(pokemon['requiredItems']) {
      description += `\nRequired Item: ${pokemon['requiredItems'].join(', ')}`;
    }

    if(pokemon['requiredAbility']) {
      description += `\nRequired Ability: ${pokemon['requiredAbility']}`;
    }

    if(pokemon['eventOnly']) {
      description += `\nThis Pokémon is only available through events.`;
    }

    if(pokemon['battleOnly']) {
      description += `\nThis Pokémon only appears in battle.`;
    }
  }

  return {
    embeds: [buildEmbed({
      title,
      description,
      color: colours.types[toID(pokemon.types[0])]
    })],
  };
}

module.exports = pokemonInfo;
