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
  const fields = [];
  
  fields.push({
    name: 'Type',
    value: move.type,
    inline: true
  });
  fields.push({
    name: 'Power',
    value: move.category,
    inline: true
  });
  fields.push({
    name: 'Power',
    value: move.basePower,
    inline: true
  });

  if(data.num === 7) {
    if(move['isZ']) {
      fields.push({
        name: 'Z Crystal',
        value: data.items.get(move['isZ'])['name'],
        inline: true
      });
    } else if (move['zMove']['effect']) {
      fields.push({
        name: 'Z Move',
        value: move.zMove.effect,
        inline: true
      });
    } else if (move['zMove']['boost']) {
      const boosts = [];
      ['hp', 'atk', 'def', 'spa', 'spd', 'spe'].forEach((el) => {
        if(move['zMove']['boost'][el]) {
          boosts.push(el.toUpperCase() + '+' + move['zMove']['boost'][el]);
        }
      });
      fields.push({
        name: 'Z Move',
        value: boosts.join(', '),
        inline: true
      });
    } else {
      fields.push({
        name: 'Z Move',
        value: move['zMove']['basePower'],
        inline: true
      });
    }
  }

  if(data.num === 8) {
    if(move.maxMove && move.maxMove.basePower) {
      fields.push({
        name: 'Max Power',
        value: move['maxMove']['basePower'],
        inline: true
      });
    } else {
      fields.push({
        name: 'Max Power',
        value: '(Max Guard)',
        inline: true
      });
    }
  }

  fields.push({
    name: 'Accuracy',
    value: move['accuracy'],
    inline: true
  });
  fields.push({
    name: 'PP (max)',
    value: `${move['pp']} (${move['pp'] * 1.6})`,
    inline: true
  });


  fields.push({
    name: 'Effect',
    value: move['desc'] || move['shortDesc']
  });

  if(move.priority > 0) {
    fields.push({
      name: 'Priority',
      value: move['priority'],
      inline: true
    });
  }

  if(params.verbose) {
    fields.push({
      name: 'Targets',
      value: move['target'],
      inline: true
    });
    fields.push({
      name: 'Introduced',
      value: move['gen'],
      inline: true
    });
  }

  if(Object.keys(move['flags']).length > 0) {
    fields.push({name: 'Move Flags', value: '\u200b'});
  }

  if(move['flags']['bullet']) {
    fields.push({
      name: 'Artillery',
      value: 'Does not affect Bulletproof Pokémon.',
      inline: true
    });
  }
  if(!move['flags']['protect']) {
    fields.push({
      name: 'Protect',
      value: 'Bypasses Protect-like moves.',
      inline: true,
    });
  }
  if(move['flags']['mirror']) {
    fields.push({
      name: 'Mirror',
      value: 'Copied by Mirror Move.',
      inline: true,
    });
  }
  if(move['flags']['authentic']) {
    fields.push({
      name: 'Authentic',
      value: 'Bypasses substitute.',
      inline: true,
    });
  }
  if(move['flags']['bite']) {
    fields.push({
      name: 'Bite',
      value: 'Boosted by Strong Jaw.',
      inline: true,
    });
  }
  if(move['flags']['charge']) {
    fields.push({
      name: 'Charge',
      value: 'Has a charging turn.',
      inline: true,
    });
  }
  if(move['flags']['contact']) {
    fields.push({
      name: 'Contact',
      value: 'Makes contact.',
      inline: true,
    });
  } else {
    fields.push({
      name: 'Contact',
      value: 'Does not make contact.',
      inline: true,
    });
  }
  if(move['flags']['dance']) {
    fields.push({
      name: 'Dance',
      value: 'Triggers Dancer.',
      inline: true,
    });
  }
  if(move['flags']['defrost']) {
    fields.push({
      name: 'Defrost',
      value: 'Thaws the user if frozen.',
      inline: true,
    });
  }
  if(move['flags']['distance'] && data.num >= 5 && data.num <= 6) {
    fields.push({
      name: 'Distance',
      value: 'Targets any Pokémon in a Triple Battle.',
      inline: true,
    });
  }
  if(move['flags']['gravity']) {
    fields.push({
      name: 'Gravity',
      value: 'Cannot be selected under Gravity.',
      inline: true,
    });
  }
  if(move['flags']['heal']) {
    fields.push({
      name: 'Heal',
      value: 'Cannot be selected under Heal Block.',
      inline: true,
    });
  }
  if(move['flags']['nonsky'] && data.num === 6) {
    fields.push({
      name: 'Non-Sky',
      value: 'Cannot be selected in a Sky Battle.',
      inline: true,
    });
  }
  if(move['flags']['powder']) {
    fields.push({
      name: 'Powder',
      value: 'Fails against Grass-types, Overcoat, and Safety Goggles.',
      inline: true,
    });
  }
  if(move['flags']['pulse']) {
    fields.push({
      name: 'Pulse',
      value: 'Boosted by Mega Launcher.',
      inline: true,
    });
  }
  if(move['flags']['punch']) {
    fields.push({
      name: 'Punch',
      value: 'Boosted by Iron Fist.',
      inline: true,
    });
  }
  if(move['flags']['recharge']) {
    fields.push({
      name: 'Recharge',
      value: 'Has a recharge turn.',
      inline: true,
    });
  }
  if(move['flags']['reflectable']) {
    fields.push({
      name: 'Reflectable',
      value: 'Affected by Magic Coat and Magic Bounce.',
      inline: true,
    });
  }
  if(move['flags']['snatch']) {
    fields.push({
      name: 'Snatch',
      value: 'Affected by Snatch.',
      inline: true,
    });
  }
  if(move['flags']['sound']) {
    fields.push({
      name: 'Sound',
      value: 'Does not affect Soundproof.',
      inline: true,
    });
  }

  return {
    embeds: [buildEmbed({
      title,
      color: colours.types[toID(move.type)],
      fields
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
