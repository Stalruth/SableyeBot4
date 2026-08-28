import { ButtonStyleTypes, InteractionResponseFlags, MessageComponentTypes } from 'discord-interactions';
import { toID } from '@pkmn/data';

import { buildEmbed } from '#utils/embed-builder';
import gens from '#utils/gen-db';
import colours from '#utils/pokemon-colours';

import { componentIDs } from './component-index.js';

function makeGenString(move, gen) {
  if (gens.data[gen].num === 7) {
    let result = '\n## Gen 7 data';
    if (move['isZ']) {
      result += `\n**Z Crystal**: ${gens.data.championsnatdex.items.get(move['isZ'])['name']}`;
    } else {
      result += `\n**Z Move**: `
      if (!move['zMove']) {
        // TODO: Varies if the move calls another move (Z-Assist); does nothing otherwise (Z-Healing Wish)
        result += 'Varies'
      } else if (move['zMove']['effect']) {
        const effects = {
          'crit2': 'Crit Rate +2',
          'redirect': 'Redirect Attacks',
          'curse': 'Heal User (If user is Ghost-type); Atk +1 (Otherwise)',
          'clearnegativeboost': 'Reset lowered stats',
          'heal': 'Heal User',
          'healreplacement': 'Heal incoming Pokémon',
        };
        result += effects[move['zMove']['effect']] ?? move['zMove']['effect'];
      } else if (move['zMove']['boost']) {
        const boosts = [];
        const statAbbreviations = {
          'hp': 'HP',
          'atk': 'Atk',
          'def': 'Def',
          'spa': 'SpA',
          'spd': 'SpD',
          'spe': 'Spe',
          'accuracy': 'Accuracy',
          'evasion': 'Evasion'
        };
        ['hp', 'atk', 'def', 'spa', 'spd', 'spe', 'accuracy', 'evasion'].forEach((el) => {
          if(move['zMove']['boost'][el]) {
            boosts.push(statAbbreviations[el] + ' +' + move['zMove']['boost'][el]);
          }
        });
        result += boosts.join(', ');
      } else {
        result += move['zMove']['basePower'];
      }
    }
    return result;
  }

  if (gens.data[gen].num === 8) {
    let result = '\n## Gen 8 data\n**Max Power**: ';
    if (move.maxMove && move['maxMove']['basePower']) {
      result += move['maxMove']['basePower'];
    } else {
      result += '(Max Guard)';
    }
    return result;
  }

  return '';
}

function getPPString(move, gen) {
  const dex = gens.data[gen].dex;
  if(dex.currentMod === 'champions') {
    if(move['pp'] === 1) {
      return "1";
    }
    return `${4 + (move['pp'] * 4 / 5)}`;
  }
  return `${move['pp']} (max. ${Math.floor(move['pp'] * 1.6)})`;
}

function moveInfo(move, gen) {
  const accString = move['accuracy'] === true ? '—' : move['accuracy'];
  const priorityString = move['priority'] === 0 ? '' : `\n**Priority**: ${move['priority'] > 0 ? '+' : ''}${move['priority']}`;
  const targetTypes = {
    'normal': 'Any adjacent Pokémon',
    'allAdjacentFoes': 'All adjacent opponents',
    'self': 'Self',
    'any': 'Any Pokémon',
    'adjacentAllyOrSelf': 'Adjacent ally or self',
    'allyTeam': 'Ally Team',
    'adjacentAlly': 'Any adjacent ally',
    'allySide': 'Ally side',
    'allAdjacent': 'All adjacent Pokémon',
    'scripted': 'Special targeting',
    'all': 'Field',
    'randomNormal': 'Random adjacent opponent',
    'allies': 'All allies',
    'adjacentFoe': 'Any adjacent opponent',
    'foeSide': 'Opponent\'s side',
  };

  let flagString = '';

  if(move['flags']['bullet']) {
    flagString += `\n**Artillery**: Does not affect Bulletproof Pokémon.`;
  }
  if(!move['flags']['protect']) {
    flagString += `\n**Protect**: Bypasses Protect-like moves.`;
  }
  if(move['flags']['mirror']) {
    flagString += `\n**Mirror**: Copied by Mirror Move.`;
  }
  if(move['flags']['bypasssub']) {
    flagString += `\n**Authentic**: Bypasses substitute.`;
  }
  if(move['flags']['bite']) {
    flagString += `\n**Bite**: Boosted by Strong Jaw.`;
  }
  if(move['flags']['charge']) {
    flagString += `\n**Charge**: Has a charging turn.`;
  }
  if(move['flags']['contact']) {
    flagString += `\n**Contact**: Makes contact.`;
  } else {
    flagString += `\n**Contact**: Does not make contact.`;
  }
  if(move['flags']['dance']) {
    flagString += `\n**Dance**: Triggers Dancer.`;
  }
  if(move['flags']['defrost']) {
    flagString += `\n**Defrost**: Thaws the user if frozen.`;
  }
  if(move['flags']['distance'] && gens.data[gen].num >= 5 && gens.data[gen].num <= 6) {
    flagString += `\n**Distance**: Targets any Pokémon in a Triple Battle.`;
  }
  if(move['flags']['gravity']) {
    flagString += `\n**Gravity**: Cannot be selected under Gravity.`;
  }
  if(move['flags']['heal']) {
    flagString += `\n**Heal**: Cannot be selected under Heal Block.`;
  }
  // TODO: reconsider. why is this in a comp oriented bot.
  if(move['flags']['nonsky'] && gens.data[gen].num === 6) {
    flagString += `\n**Non-Sky**: Cannot be selected in a Sky Battle.`;
  }
  if(move['flags']['powder']) {
    flagString += `\n**Powder**: Fails against Grass-types, Overcoat, and Safety Goggles.`;
  }
  if(move['flags']['pulse']) {
    flagString += `\n**Pulse**: Boosted by Mega Launcher.`;
  }
  if(move['flags']['punch']) {
    flagString += `\n**Punch**: Boosted by Iron Fist.`;
  }
  if(move['flags']['recharge']) {
    flagString += `\n**Recharge**: Has a recharge turn.`;
  }
  if(move['flags']['reflectable']) {
    flagString += `\n**Reflectable**: Affected by Magic Coat and Magic Bounce.`;
  }
  if(move['flags']['slicing']) {
    flagString += `\n**Slicing**: Boosted by Sharpness.`;
  }
  if(move['flags']['snatch']) {
    flagString += `\n**Snatch**: Affected by Snatch.`;
  }
  if(move['flags']['sound']) {
    flagString += `\n**Sound**: Does not affect Soundproof.`;
  }
  if(move['flags']['wind']) {
    flagString += `\n**Wind**: Triggers Wind Power and Wind Rider.`;
  }

  return {
    flags: InteractionResponseFlags.IS_COMPONENTS_V2,
    components: [
      {
        type: MessageComponentTypes.CONTAINER,
        id: componentIDs.ROOT,
        accent_color: colours.types[toID(move.type)],
        components: [
          {
            type: MessageComponentTypes.TEXT_DISPLAY,
            content: `# Move: ${move['name']}\n${move['desc']}\n\n**Type**: ${move['type']}\n**Category**: ${move['category']}\n**Power**: ${move['basePower']}\n**Accuracy**: ${accString}\n**PP**: ${getPPString(move, gen)}${priorityString}\n**Targets**: ${targetTypes[move['target']]}${makeGenString(move, gen)}\n## Move Flags${flagString}`
          }
        ]
      }
    ]
  };
}

export default moveInfo;
