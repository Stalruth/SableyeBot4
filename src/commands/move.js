'use strict';

const Dex = require('@pkmn/dex');
const Data = require('@pkmn/data');

const dataSearch = require('datasearch');

const command = {
  description: 'Return information on the given move.',
  options: [
    {
      name: 'name',
      type: 'STRING',
      description: 'Name of the Move',
      required: true,
    },
    {
      name: 'verbose',
      type: 'BOOLEAN',
      description: 'Show more information such as target and generation.',
    },
    {
      name: 'gen',
      type: 'INTEGER',
      description: 'The Generation to return information from',
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

const process = async function(client, interaction) {
  await interaction.defer();

  const name = interaction.options.getString('name');
  const gen = interaction.options.getInteger('gen') ?? Dex.Dex.gen;
  const verbose = interaction.options.getBoolean('verbose') ?? false;

  const data = new Data.Generations(Dex.Dex).get(gen);

  const move = dataSearch(data.moves, Data.toID(name))?.result;

  if(move === null) {
    await interaction.editReply(`Could not find a move named ${name} in Generation ${gen}.`);
    return;
  }

  let reply = `${move['name']} [${move['type']}] [${move['category']}]`;
  reply += `\nPower: ${move['basePower']} `;

  if(gen === 7) {
    if(move['isZ']) {
      reply += `(Z: ${data.items.get(move['isZ'])['name']})`;
    } else if (move['zMove']['effect']) {
      reply += `(Z: ${move.zMove.effect})`;
    } else if (move['zMove']['boost']) {
      const stats = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
      const boosts = [];
      stats.forEach((el) => {
        if(move['zMove']['boost'][el]) {
          boosts.push(el.toUpperCase() + '+' + move['zMove']['boost'][el]);
        }
      });
      reply += `(Z: ${boosts.join(', ')})`;
    } else {
      reply += `(Z: ${move['zMove']['basePower']})`;
    }
  }

  if(gen === 8) {
    if(move.maxMove && move.maxMove.basePower) {
      reply += `(Max Power: ${move['maxMove']['basePower']})`;
    } else {
      reply += `(Max Guard)`;
    }
  }

  reply += `; Accuracy: ${move['accuracy']}; PP: ${move['pp']} (max ${Math.floor(move['pp']*1.6)})`;
  reply += `\n${(move['desc'] || move['shortDesc'])}`;
  reply += `\nPriority: ${(move['priority'] > 0) ? '+' : ''}${move['priority']}`;

  if(verbose) {
    reply += `\nTarget: ${move['target']}`;
    reply += `\nIntroduced: Generation ${move['gen']}`;
  }

  if(Object.keys(move['flags']).length > 0) {
    reply += `\n~~`;
  }
  if(move['flags']['bullet']) {
    reply += `\nArtillery: Does not affect Bulletproof Pokémon.`;
  }
  if(!move['flags']['protect']) {
    reply += `\nProtect: Blocked by Detect, Protect, `;
    if(move['category'] === 'status') {
      reply += `and Spiky Shield.`;
    } else {
      reply += `Spiky Shield, and King's Shield.`;
    }
  }
  if(move['flags']['mirror']) {
    reply += `\nMirror: Can be copied by Mirror Move.`;
  }
  if(move['flags']['authentic']) {
    reply += `\nAuthentic: Bypasses a target's substitute.`;
  }
  if(move['flags']['bite']) {
    reply += `\nBite: Power is boosted by Strong Jaw.`;
  }
  if(move['flags']['charge']) {
    reply += `\nCharge: This move spends a turn charging before executing.`;
  }
  if(move['flags']['contact']) {
    reply += `\nContact: Makes contact.`;
  }
  if(move['flags']['dance']) {
    reply += `\nDance: Triggers the Dancer Ability.`;
  }
  if(move['flags']['defrost']) {
    reply += `\nDefrost: Thaws the user if completed while frozen`;
  }
  if(move['flags']['distance'] && gen >=5 && gen <= 6) {
    reply += `\nDistance: Can target Pokémon positioned anywhere in a Triple Battle.`;
  }
  if(move['flags']['gravity']) {
    reply += `\nGravity: Cannot be selected or executed under Gravity.`;
  }
  if(move['flags']['heal']) {
    reply += `\nHeal: Cannot be selected or executed under Heal Block.`;
  }
  if(move['flags']['nonsky'] && gen === 6) {
    reply += `\nNon-Sky: Cannot be selected or excecuted in a Sky Battle.`;
  }
  if(move['flags']['powder']) {
    reply += `\nPowder: Does not affect Grass-type Pokémon, Pokémon with the ability Overcoat or the item Safety Goggles`;
  }
  if(move['flags']['pulse']) {
    reply += `\nPulse: Power is boosted by Mega Launcher`;
  }
  if(move['flags']['punch']) {
    reply += `\nPunch: Power is boosted by Iron Fist.`;
  }
  if(move['flags']['recharge']) {
    reply += `\nRecharge: If this move succeeds, the user skips the next turn.`;
  }
  if(move['flags']['reflectable']) {
    reply += `\nReflectable: Can be reflected by Magic Coat or Magic Bounce`;
  }
  if(move['flags']['snatch']) {
    reply += `\nSnatch: Is affected by Snatch.`;
  }
  if(move['flags']['sound']) {
    reply += `\nSound: Does not affect Soundproof Pokémon.`;
  }

  await interaction.editReply(reply);
};

module.exports = {command, process};

