import { ButtonStyleTypes, InteractionResponseFlags, MessageComponentTypes } from 'discord-interactions';

import { buildEmbed } from '#utils/embed-builder';
import gens from '#utils/gen-db';

import { componentIDs } from './component-index.js';

function getRecentGenInfo(item, gen) {
  if(gens.data[gen].num < 4) {
    return '';
  } else {
    let result = '\n\n';
    if(item['fling']) {
      result += `**Fling**: Has ${item['fling']['basePower']} Power`;
      const flingStatus = item['fling']['status'] || item['fling']['volatileStatus'];
      const flingEffectNames = {
        'flinch': 'flinches',
        'brn': 'burns',
        'par': 'paralyzes',
        'psn': 'poisons',
        'tox': 'badly poisons'
      };
      if(flingStatus) {
        result += ` and ${flingEffectNames[flingStatus]} the target.`;
      } else {
        result += '.';
      }
    } else {
      result += 'This item cannot be used with **Fling**.';
    }
    if(item['naturalGift']) {
      result += `\n**Natural Gift**: Has ${item['naturalGift']['basePower']} Power and is ${item['naturalGift']['type']}-type when this Item is held.`
    }
    return result;
  }
}

function itemInfo(item, gen) {
  return {
    flags: InteractionResponseFlags.IS_COMPONENTS_V2,
    components: [
      {
        type: MessageComponentTypes.CONTAINER,
        id: componentIDs.ROOT,
        accent_color: 0x5F32AB,
        components: [
          {
            type: MessageComponentTypes.TEXT_DISPLAY,
            content: `# Item: ${item['name']}\n${item['desc']}${getRecentGenInfo(item, gen)}`
          }
        ]
      }
    ]
  };
}

export default itemInfo;
