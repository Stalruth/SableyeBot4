'use strict';

const { InteractionResponseFlags, InteractionResponseType } = require('discord-interactions');
const Data = require('@pkmn/data');

const getargs = require('discord-getarg');
const buildEmbed = require('embed-builder');
const gens = require('gen-db');
const colours = require('pkmn-colours');
const { completePokemon } = require('pkmn-complete');

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
      type: 3,
      description: 'Name of the Pokémon',
      required: true,
      autocomplete: true,
    },
    {
      name: 'verbose',
      type: 5,
      description: 'Show more information such as Evolution chain and Egg Groups.',
    },
    {
      name: 'gen',
      type: 3,
      description: 'The Generation used for lookup.',
      choices: gens.names,
    },
  ],
};

const process = function(interaction) {
  const args = getargs(interaction).params;

  const data = gens.data[args.gen ? args.gen : 'gen8natdex'];

  const pokemon = data.species.get(Data.toID(args.name));

  if(!pokemon?.exists) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [buildEmbed({
          title: "Error",
          description: `Could not find a Pokemon named ${args.name} in the given generation.`,
          color: 0xCC0000,
        })],
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    };
  }

  let title = `No. ${pokemon['num']}: ${pokemon['name']}`;
  let description = `${pokemon['types'].join('/')} Type`;

  if(!args.gen < 3) {
    const abilities = [pokemon['abilities'][0]]
    if(pokemon['abilities'][1]) {
      abilities.push(pokemon['abilities'][1]);
    }
    if(pokemon['abilities']['H'] && !pokemon['unreleasedHidden']) {
      abilities.push(pokemon['abilities']['H'] + ' (Hidden)');
    }
    description += `\nAbilities: ${abilities.join(', ')}`;
  }

  const statNames = ['HP', 'Atk', 'Def', ...(args.gen <= 2 ? ['Spc'] : ['SpA', 'SpD']), 'Spe']
  const stats = [
    pokemon.baseStats.hp,
    pokemon.baseStats.atk,
    pokemon.baseStats.def,
    ...(args.gen === 1 ? [
      pokemon.baseStats.spa
    ] : [
      pokemon.baseStats.spa,
      pokemon.baseStats.spd
    ]),
    pokemon.baseStats.spe
  ];
  description += `\n${statNames.join('/')}: ${stats.join('/')} [BST: ${stats.reduce((ac, el) => ac + el)}]`;

  if(args.verbose) {
    description += `\nIntroduced: Generation ${pokemon['gen']}`;
    description += `\nWeight: ${pokemon['weightkg']}kg (${lowKickPower(pokemon['weightkg'])} BP); Height: ${pokemon['heightm']}m`;
  }

  if(pokemon['baseSpecies'] !== pokemon['name']) {
    description += `\nBase Species: ${pokemon['baseSpecies']}`;
  }

  if(pokemon['otherFormes']) {
    description += `\nOther Formes: ${pokemon['otherFormes'].join(', ')}`;
  }

  if(args.verbose) {
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
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      embeds: [buildEmbed({
        title,
        description,
        color: colours.types[Data.toID(pokemon.types[0])]
      })],
    },
  };
};

function autocomplete(interaction) {
  const args = getargs(interaction).params;
  return {
    type: InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
    data: {
      choices: completePokemon(args['name']),
    },
  };
}

module.exports = {command, process, autocomplete};

