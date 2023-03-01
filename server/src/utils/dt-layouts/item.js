import { ButtonStyleTypes, InteractionResponseFlags, MessageComponentTypes } from 'discord-interactions';

import { buildEmbed } from '#utils/embed-builder';

function itemInfo(item, gen, verbose) {
  const title = `Item: ${item['name']}`;
  const description = item['desc'];
  
  const fields = [];

  if(verbose) {
    if(item['naturalGift']) {
      fields.push({
        'name': 'Natural Gift',
        'value':`${item['naturalGift']['basePower']} Power ${item['naturalGift']['type']}-type.`,
      });
    }
    if(item['fling']) {
      const flingStatus = item['fling']['status'] || item['fling']['volatileStatus'];
      const statusNames = {
        'flinch': 'Flinches',
        'brn': 'Burns',
        'par': 'Paralyzes',
        'psn': 'Poisons',
        'tox': 'Badly Poisons'
      };
      fields.push({
        'name': 'Fling',
        'value': `${item['fling']['basePower']} Power${flingStatus ? (', ' + statusNames[flingStatus] + ' the target.') : ''}`,
        'inline': true,
      });
    }

    fields.push({
      'name': 'Introduced',
      'value': `Generation ${item['gen']}`,
      'inline': true,
    });
  }

  return {
    embeds: [buildEmbed({
      title,
      description,
      fields,
    })],
    components: [{
      type: MessageComponentTypes.ACTION_ROW,
      components: [{
        type: MessageComponentTypes.BUTTON,
        custom_id: `${item['id']}|${gen}|${!verbose ? 'true' : ''}|Item`,
        style: ButtonStyleTypes.SECONDARY,
        label: !verbose ? 'Verbose' : 'Compact',
      }],
    }],
  };
}

export default itemInfo;
