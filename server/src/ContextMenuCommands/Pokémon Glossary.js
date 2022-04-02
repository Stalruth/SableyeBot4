'use strict';

const { InteractionResponseFlags, InteractionResponseType } = require('discord-interactions');
const { toID } = require('@pkmn/data');

const { dt, getData } = require('dt-utils');
const { buildEmbed, buildError } = require('embed-builder');
const gens = require('gen-db');
const { graphs } = require('pokemon-complete');

const definition = {
  type: 3,
};

const process = function(interaction) {
  const contents = [];
  const results = new Set();
  const genData = gens.data['natdex'];

  for(const message of Object.values(interaction.data.resolved.messages)) {
    const searchSpace = [
      message.content,
      ...(message.embeds ?? []).reduce((acc, cur) => [
        ...acc,
        cur.description,
        ...(cur.fields ?? []).reduce((values, field) => [...values, field.value], []),
      ], []).filter(el=>!!el),
    ].map(value => value.toLowerCase().replace(/[^a-z0-9]+/g, ' '));

    const effectTypes = {
      'species': 'Pokemon',
      'moves': 'Move',
      'items': 'Item',
      'abilities': 'Ability',
      'natures': 'Nature'
    };

    Object.keys(effectTypes).forEach((effectCollection) => {
      graphs[effectCollection].forEach((effect) => {
        const regex = new RegExp(`\\b${effect.split('').join(' ?')}\\b`, 'g');
        for(const contentId of searchSpace) {
          if(contentId.search(regex) != -1) {
            results.add(genData[effectCollection].get(effect));
            return;
          }
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
          custom_id: '|natdex|',
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

module.exports = {
  definition,
  command: {
    process
  }
};

