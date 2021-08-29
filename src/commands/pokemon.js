'use strict';

const Dex = require('@pkmn/dex');
const Data = require('@pkmn/data');

const dataSearch = require('datasearch');
const getarg = require('discord-getarg');

const lowKickPower = function(weight) {
  if(weight < 10) return 20;
  if(weight < 25) return 40;
  if(weight < 50) return 60;
  if(weight < 100) return 80;
  if(weight < 200) return 100;
}

const command = {
  description: 'Return information on the given Pokémon.',
  options: [
    {
      name: 'name',
      type: 'STRING',
      description: 'Name of the Pokémon',
      required: true,
    },
    {
      name: 'verbose',
      type: 'BOOLEAN',
      description: 'Show more information such as Evolution chain and Egg Groups.',
    },
    {
      name: 'gen',
      type: 'INTEGER',
      description: 'The Generation used for lookup.',
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
  ],
};

const process = function(req, res) {
  const name = getarg(req.body, 'name').value;
  const gen = getarg(req.body, 'gen')?.value ?? Dex.Dex.gen;
  const verbose = getarg(req.body, 'verbose')?.value ?? false;

  const data = new Data.Generations(Dex.Dex).get(gen);

  const pokemon = dataSearch(data.species, Data.toID(name))?.result;

  if(!pokemon) {
    res.json({
      type: 4,
      data: {
        content: `Could not find a Pokémon named ${name} in Generation ${gen}.`,
      },
    });
    return;
  }

  let reply = `No. ${pokemon['num']}: ${pokemon['name']} [${pokemon['types'].join('/')}]`;

  if(gen >= 3) {
    const abilities = [pokemon['abilities'][0]]
    if(pokemon['abilities'][1]) {
      abilities.push(pokemon['abilities'][1]);
    }
    if(pokemon['abilities']['H'] && !pokemon['unreleasedHidden']) {
      abilities.push(pokemon['abilities']['H'] + ' (Hidden)');
    }
    reply += `\nAbilities: ${abilities.join(', ')}`;
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
  reply += `\n${statNames.join('/')}: ${stats.join('/')} [BST: ${stats.reduce((ac, el) => ac + el)}]`;

  if(verbose) {
    reply += `\nIntroduced: Generation ${pokemon['gen']}`;
    reply += `\nWeight: ${pokemon['weightkg']}kg (${lowKickPower(pokemon['weightkg'])} BP)`;
  }

  if(pokemon['baseSpecies'] !== pokemon['name']) {
    reply += `\nBase Species: ${pokemon['baseSpecies']}`;
  }

  if(pokemon['otherFormes']) {
    reply += `\nOther Formes: ${pokemon['otherFormes'].join(', ')}`;
  }

  if(verbose) {
    if(pokemon['prevo']) {
      reply += `\nPre-evolution: ${pokemon['prevo']}`;
    }
    if(pokemon['evos']) {
      reply += `\nEvolution(s): ${pokemon['evos'].join(', ')}`;
    }
    reply += `\nEgg Groups: ${pokemon['eggGroups']}`;

    reply += `\nGender Ratio: `
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
    reply += ratios.join(', ');

    if(pokemon['requiredItems']) {
      reply += `\nRequired Item: ${pokemon['requiredItems'].join(', ')}`;
    }

    if(pokemon['requiredAbility']) {
      reply += `\nRequired Ability: ${pokemon['requiredAbility']}`;
    }

    if(pokemon['eventOnly']) {
      reply += `\nThis Pokémon is only available through events.`;
    }

    if(pokemon['battleOnly']) {
      reply += `\nThis Pokémon only appears in battle.`;
    }
  }

  res.json({
    type: 4,
    data: {
      content: reply,
    },
  });
};

module.exports = {command, process};

