'use strict';

const { InteractionResponseFlags } = require('discord-interactions');

const buildEmbed = require('embed-builder');
const gens = require('gen-db');

function itemInfo(item, gen, verbose) {
  const title = item['name'];
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
      });
    }

    fields.push({
      'name': 'Introduced',
      'value': `Generation ${item['gen']}`,
    });
  }

  return {
    embeds: [buildEmbed({
      title,
      description,
      fields,
    })],
  };
}

module.exports = itemInfo;
