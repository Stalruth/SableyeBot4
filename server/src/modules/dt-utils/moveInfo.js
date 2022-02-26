'use strict';

const { InteractionResponseFlags } = require('discord-interactions');
const { toID } = require('@pkmn/data');

const { buildEmbed } = require('embed-builder');
const gens = require('gen-db');
const colours = require('pokemon-colours');

function moveInfo(move, gen, verbose) {
  const title = `${move['name']}`;
  const fields = [];
  
  fields.push({
    name: 'Type',
    value: move.type,
    inline: true
  });
  fields.push({
    name: 'Category',
    value: move.category,
    inline: true
  });
  fields.push({
    name: 'Power',
    value: move.basePower,
    inline: true
  });

  if(gen === 7) {
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

  if(gen === 8) {
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

  const description = move['desc'] || move['shortDesc'];

  if(move.priority > 0) {
    fields.push({
      name: 'Priority',
      value: move['priority'],
      inline: true
    });
  }

  if(verbose) {
    fields.push({
      name: 'Targets',
      value: move['target'],
      inline: true
    });
    fields.push({
      name: 'Introduced',
      value: `Generation ${move['gen']}`,
      inline: true
    });
  }

  fields.push({name: 'Move Flags', value: '\u200b'});

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
  if(move['flags']['distance'] && gen >= 5 && gen <= 6) {
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
  if(move['flags']['nonsky'] && gen === 6) {
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
      description,
      color: colours.types[toID(move.type)],
      fields
    })],
  };
}

module.exports = moveInfo;
