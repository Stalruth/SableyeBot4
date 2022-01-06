'use strict';

const { InteractionResponseFlags, InteractionResponseType } = require('discord-interactions');
const { toID } = require('@pkmn/data');

const { dt, getData } = require('dt-utils');
const buildEmbed = require('embed-builder');
const gens = require('gen-db');
const { graphs } = require('pkmn-complete');

const command = {
  type: 3,
};

const process = function(interaction) {
  const contents = [];
  const results = [];
  const genData = gens.data['gen8natdex'];

  for(const message in interaction.data.resolved.messages) {
    const contentId = toID(interaction.data.resolved.messages[message].content);

    const effectTypes = {
      'species': 'Pokemon',
      'moves': 'Move',
      'items': 'Item',
      'abilities': 'Ability',
      'natures': 'Nature'
    };

    Object.keys(effectTypes).forEach((effectCollection) => {
      const effects = new Set();
      graphs[effectCollection].forEach((effect) => {
        if(contentId.search(effect) != -1) {
          effects.add(`${effect}`);
        }
      });
      results.push(...[...effects].map(e => {
        return {
          label: `${genData[effectCollection].get(e).name} (${effectTypes[effectCollection]})`,
          value: `${effectTypes[effectCollection]}|${e}`,
        };
      }));
    });
  }
  
  if(results.length === 0) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [buildEmbed({
          title: "Error",
          description: `Could not find any results in the selected message.`,
          color: 0xCC0000,
        })],
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    };
  }
  
  if(results.length === 1) {
    const [ effectType, id ] = results[0].value.split('|');
    const data = getData(genData, id)[0];
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: dt[effectType](data, genData.num, false),
    };
  }

  const cmp = (lhs, rhs) => {
    if (lhs.label < rhs.label) {
      return -1
    }
    return rhs.label === lhs.label ? 0 : 1;
  };
  
  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      embeds: [buildEmbed({
        title: "Select Object",
        description: "Please select the item to look up",
      })],
      components: [{
        type: 1,
        components: [{
          type: 3,
          custom_id: '|gen8natdex|',
          options: results.sort(cmp).slice(0,25)
        }]
      }],
    },
  };
};

module.exports = {command, process};

