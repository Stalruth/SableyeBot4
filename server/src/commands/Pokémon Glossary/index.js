import { InteractionResponseFlags, InteractionResponseType, MessageComponentTypes } from 'discord-interactions';
import { toID } from '@pkmn/data';

import { dt, getData } from '#utils/dt-formatter';
import { buildEmbed, buildError } from '#utils/embed-builder';
import gens from '#utils/gen-db';
import { graphs } from '#utils/pokemon-complete';

import { componentIDs } from './components-index.js';

const definition = {
  type: 3,
  integration_types: [0, 1],
  contexts: [0, 1, 2]
};

async function process(interaction, respond) {
  const contents = [];
  const results = new Set();
  const genData = gens.data['championsnatdex'];

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
    return await respond({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        flags: InteractionResponseFlags.EPHEMERAL | InteractionResponseFlags.IS_COMPONENTS_V2,
        components: [
          {
            type: MessageComponentTypes.CONTAINER,
            accent_color: 0xCC0000,
            components: [
              {
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: `Could not find any results in the selected message.`
              }
            ]
          }
        ]
      },
    });
  }

  if(results.size === 1) {
    const data = [...results][0];
    const output = dt[data.effectType](data, 'championsnatdex');
    return await respond({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: Object.assign(output, {
        flags: InteractionResponseFlags.EPHEMERAL | output.flags
      }),
    });
  }

  const cmp = (lhs, rhs) => {
    if (lhs.label < rhs.label) {
      return -1
    }
    return rhs.label === lhs.label ? 0 : 1;
  };

  return await respond({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      components: [{
        type: MessageComponentTypes.CONTAINER,
        id: componentIDs.ROOT,
        accent_color: 0x5F32AB,
        components: [
          {
            type: MessageComponentTypes.ACTION_ROW,
            id: componentIDs.DISAM_DROPDOWN,
            components: [{
              type: MessageComponentTypes.STRING_SELECT,
              custom_id: '-',
              options: [...results].map(e=>({
                label: `${e.name} (${e.effectType})`,
                value: `${e.effectType}|${e.id}`,
              })).sort(cmp).slice(0,25)
            }]
          },
          {
            type: MessageComponentTypes.TEXT_DISPLAY,
            content: 'Select Object to look up'
          }
        ]
      }],
      flags: InteractionResponseFlags.EPHEMERAL | InteractionResponseFlags.IS_COMPONENTS_V2,
    },
  });
};

export default {
  definition,
  command: {
    process
  }
};

