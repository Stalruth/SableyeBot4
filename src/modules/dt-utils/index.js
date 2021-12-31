'use strict';

const { InteractionResponseFlags, InteractionResponseType } = require('discord-interactions');
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

function abilityInfo(args) {
  const { params } = args;
  const data = gens.data[params.gen ? params.gen : 'gen8natdex'];

  const ability = data.abilities.get(params.name);

  if(!ability?.exists) {
    return {
      embeds: [buildEmbed({
        title: "Error",
        description: `Could not find an ability named ${params.name} in the given generation.`,
        color: 0xCC0000,
      })],
      flags: InteractionResponseFlags.EPHEMERAL,
    };
  }

  return {
    embeds: [buildEmbed({
      title: ability['name'],
      description: ability['desc'],
    })],
  };
}

function itemInfo(args) {
  const { params } = args;

  const data = gens.data[params.gen ? params.gen : 'gen8natdex'];

  const item = data.items.get(params.name);

  if(!item?.exists) {
    return {
      embeds: [buildEmbed({
        title: "Error",
        description: `Could not find an item named ${params.name} in the given generation.`,
        color: 0xCC0000,
      })],
      flags: InteractionResponseFlags.EPHEMERAL,
    };
  }

  let title = item['name'];
  let description = item['desc'];

  if(params.verbose) {
    if(item['naturalGift']) {
      description += `\nNatural Gift: ${item['naturalGift']['basePower']} Power ${item['naturalGift']['type']}-type.`;
    }
    if(item['fling']) {
      description += `\nFling: ${item['fling']['basePower']} Power`;
      if(item['fling']['status'] || item['fling']['volatileStatus']) {
        description += `, causes ${item['fling']['status'] || item['fling']['volatileStatus']}`;
      }
    }

    description += `\nIntroduced: Generation ${item['gen']}`;
  }

  return {
    embeds: [buildEmbed({
      title,
      description,
    })],
  };
}

function moveInfo(args) {
  const { params } = args;

  const data = gens.data[params.gen ? params.gen : 'gen8natdex'];

  const move =  data.moves.get(params.name);

  if(!move?.exists) {
    return {
      embeds: [buildEmbed({
        title: "Error",
        description: `Could not find a move named ${params.name} in the given generation.`,
        color: 0xCC0000,
      })],
      flags: InteractionResponseFlags.EPHEMERAL,
    };
  }

  const title = `${move['name']}`;
  let description = `Type: ${move['type']}; Category: [${move['category']}]`;
  description += `\nPower: ${move['basePower']} `;

  if(data.num === 7) {
    if(move['isZ']) {
      description += `(Z: ${data.items.get(move['isZ'])['name']})`;
    } else if (move['zMove']['effect']) {
      description += `(Z: ${move.zMove.effect})`;
    } else if (move['zMove']['boost']) {
      const stats = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
      const boosts = [];
      stats.forEach((el) => {
        if(move['zMove']['boost'][el]) {
          boosts.push(el.toUpperCase() + '+' + move['zMove']['boost'][el]);
        }
      });
      description += `(Z: ${boosts.join(', ')})`;
    } else {
      description += `(Z: ${move['zMove']['basePower']})`;
    }
  }

  if(data.num === 8) {
    if(move.maxMove && move.maxMove.basePower) {
      description += `(Max Power: ${move['maxMove']['basePower']})`;
    } else {
      description += `(Max Guard)`;
    }
  }

  description += `; Accuracy: ${move['accuracy']}; PP: ${move['pp']} (max ${Math.floor(move['pp']*1.6)})`;
  description += `\n${(move['desc'] || move['shortDesc'])}`;
  description += `\nPriority: ${(move['priority'] > 0) ? '+' : ''}${move['priority']}`;

  if(params.verbose) {
    description += `\nTarget: ${move['target']}`;
    description += `\nIntroduced: Generation ${move['gen']}`;
  }

  if(Object.keys(move['flags']).length > 0) {
    description += `\n~~`;
  }
  if(move['flags']['bullet']) {
    description += `\nArtillery: Does not affect Bulletproof Pokémon.`;
  }
  if(!move['flags']['protect']) {
    description += `\nProtect: Blocked by Detect, Protect, `;
    if(move['category'] === 'status') {
      description += `and Spiky Shield.`;
    } else {
      description += `Spiky Shield, and King's Shield.`;
    }
  }
  if(move['flags']['mirror']) {
    description += `\nMirror: Can be copied by Mirror Move.`;
  }
  if(move['flags']['authentic']) {
    description += `\nAuthentic: Bypasses a target's substitute.`;
  }
  if(move['flags']['bite']) {
    description += `\nBite: Power is boosted by Strong Jaw.`;
  }
  if(move['flags']['charge']) {
    description += `\nCharge: This move spends a turn charging before executing.`;
  }
  if(move['flags']['contact']) {
    description += `\nContact: Makes contact.`;
  }
  if(move['flags']['dance']) {
    description += `\nDance: Triggers the Dancer Ability.`;
  }
  if(move['flags']['defrost']) {
    description += `\nDefrost: Thaws the user if completed while frozen`;
  }
  if(move['flags']['distance'] && data.num >= 5 && data.num <= 6) {
    description += `\nDistance: Can target Pokémon positioned anywhere in a Triple Battle.`;
  }
  if(move['flags']['gravity']) {
    description += `\nGravity: Cannot be selected or executed under Gravity.`;
  }
  if(move['flags']['heal']) {
    description += `\nHeal: Cannot be selected or executed under Heal Block.`;
  }
  if(move['flags']['nonsky'] && data.num === 6) {
    description += `\nNon-Sky: Cannot be selected or excecuted in a Sky Battle.`;
  }
  if(move['flags']['powder']) {
    description += `\nPowder: Does not affect Grass-type Pokémon, Pokémon with the ability Overcoat or the item Safety Goggles`;
  }
  if(move['flags']['pulse']) {
    description += `\nPulse: Power is boosted by Mega Launcher`;
  }
  if(move['flags']['punch']) {
    description += `\nPunch: Power is boosted by Iron Fist.`;
  }
  if(move['flags']['recharge']) {
    description += `\nRecharge: If this move succeeds, the user skips the next turn.`;
  }
  if(move['flags']['reflectable']) {
    description += `\nReflectable: Can be reflected by Magic Coat or Magic Bounce`;
  }
  if(move['flags']['snatch']) {
    description += `\nSnatch: Is affected by Snatch.`;
  }
  if(move['flags']['sound']) {
    description += `\nSound: Does not affect Soundproof Pokémon.`;
  }

  return {
    embeds: [buildEmbed({
      title,
      description,
      color: colours.types[toID(move.type)]
    })],
  };
}

function natureInfo(args) {
  const { params } = args;

  // Uh oh sisters! hardcoding!
  const neutralNatures = {
    'Hardy': 'atk',
    'Docile': 'def',
    'Bashful': 'spa',
    'Quirky': 'spd',
    'Serious': 'spe',
  };
  
  const fullNames = {
    'atk': 'Attack',
    'def': 'Defence',
    'spa': 'Special Attack',
    'spd': 'Special Defence',
    'spe': 'Speed',
  };

  const nature = gens.data['gen8'].natures.get(params.name);

  const title = nature.name;
  const fields = [
    {
      name: 'Boosted',
      value: fullNames[nature['plus'] ? nature['plus'] : neutralNatures[nature.name]],
      inline: true,
    },
    {
      name: 'Lowered',
      value: fullNames[nature['minus'] ? nature['minus'] : neutralNatures[nature.name]],
      inline: true,
    },
  ];

  return {
    embeds: [buildEmbed({
      title,
      fields,
      color: colours.stats[nature.plus],
    })],
  };
}

function pokemonInfo(args) {
  const { params } = args;

  const data = gens.data[params.gen ? params.gen : 'gen8natdex'];

  const pokemon = data.species.get(params.name);

  if(!pokemon?.exists) {
    return {
      embeds: [buildEmbed({
        title: "Error",
        description: `Could not find a Pokemon named ${params.name} in the given generation.`,
        color: 0xCC0000,
      })],
      flags: InteractionResponseFlags.EPHEMERAL,
    };
  }

  let title = `No. ${pokemon['num']}: ${pokemon['name']}`;
  let description = `${pokemon['types'].join('/')} Type`;

  if(!data.num < 3) {
    const abilities = [pokemon['abilities'][0]]
    if(pokemon['abilities'][1]) {
      abilities.push(pokemon['abilities'][1]);
    }
    if(pokemon['abilities']['H'] && !pokemon['unreleasedHidden']) {
      abilities.push(pokemon['abilities']['H'] + ' (Hidden)');
    }
    description += `\nAbilities: ${abilities.join(', ')}`;
  }

  const statNames = ['HP', 'Atk', 'Def', ...(data.num <= 2 ? ['Spc'] : ['SpA', 'SpD']), 'Spe']
  const stats = [
    pokemon.baseStats.hp,
    pokemon.baseStats.atk,
    pokemon.baseStats.def,
    ...(data.num === 1 ? [
      pokemon.baseStats.spa
    ] : [
      pokemon.baseStats.spa,
      pokemon.baseStats.spd
    ]),
    pokemon.baseStats.spe
  ];
  description += `\n${statNames.join('/')}: ${stats.join('/')} [BST: ${stats.reduce((ac, el) => ac + el)}]`;

  if(params.verbose) {
    description += `\nIntroduced: Generation ${pokemon['gen']}`;
    description += `\nWeight: ${pokemon['weightkg']}kg (${lowKickPower(pokemon['weightkg'])} BP); Height: ${pokemon['heightm']}m`;
  }

  if(pokemon['baseSpecies'] !== pokemon['name']) {
    description += `\nBase Species: ${pokemon['baseSpecies']}`;
  }

  if(pokemon['otherFormes']) {
    description += `\nOther Formes: ${pokemon['otherFormes'].join(', ')}`;
  }

  if(params.verbose) {
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

const dt = {
  Ability: abilityInfo,
  Item: itemInfo,
  Move: moveInfo,
  Nature: natureInfo,
  Pokemon: pokemonInfo,
};

module.exports = { dt };
