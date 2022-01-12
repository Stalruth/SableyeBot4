'use strict';

const { InteractionResponseFlags } = require('discord-interactions');

const buildEmbed = require('embed-builder');
const gens = require('gen-db');

function itemInfo(item, gen, verbose) {
  let title = item['name'];
  let description = item['desc'];

  if(verbose) {
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

module.exports = itemInfo;
