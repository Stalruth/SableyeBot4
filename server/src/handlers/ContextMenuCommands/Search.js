'use strict';

const { InteractionResponseFlags, InteractionResponseType } = require('discord-interactions');
const { toID } = require('@pkmn/data');

const { dt, getData } = require('dt-utils');
const { buildEmbed, buildError } = require('embed-builder');
const gens = require('gen-db');
const { graphs } = require('pkmn-complete');

const command = {
  type: 3,
};

const process = function(interaction) {
  const contents = [];
  const results = new Set();
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
          results.add(genData[effectCollection].get(effect));
        }
      });
    });
  }

  if(results.size === 0) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [
          buildError(`Could not find any results in the selected message.`)
        ],
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    };
  }

  if(results.size === 1) {
    const data = [...results][0];
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: Object.assign(dt[data.effectType](data, genData.num, false), {
        flags: InteractionResponseFlags.EPHEMERAL,
      }),
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
          options: [...results].map(e=>({
            label: `${e.name} (${e.effectType})`,
            value: `${e.effectType}|${e.id}`,
          })).sort(cmp).slice(0,25)
        }]
      }],
      flags: InteractionResponseFlags.EPHEMERAL,
    },
  };
};

module.exports = {command, process};

