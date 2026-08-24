import { ButtonStyleTypes, InteractionResponseFlags, InteractionResponseType, MessageComponentTypes } from 'discord-interactions';

import { getComponentsById } from '#utils/get-component';
import gens from '#utils/gen-db';
import { listMoves } from '#utils/learnset-utils';
import isInteractionStarter from '#utils/isInteractionStarter';

import { componentIDs } from './component-index.js';

async function process(interaction, respond) {
  const isAuthor = isInteractionStarter(interaction);
  if(!isAuthor) {
    return respond({
      type: InteractionResponseType.UPDATE_MESSAGE,
    });
  }

  if(interaction.data.custom_id === 'tera') {
    return processTera(interaction, respond);
  }

  processCategory(interaction, respond);
}

async function processCategory(interaction, respond) {
  const [pokemonId, category, gen, restrictionId] = interaction.data.custom_id.split('|');
  const data = gens.data[gen] ?? gens.data['championsnatdex'];
  const pokemon = data.species.get(pokemonId);
  const restriction = restrictionId ? undefined : restrictionId;
  const components = getComponentsById(interaction.message, componentIDs);

  if(!pokemon?.exists) {
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
                content: `Could not find a Pokémon named ${args.pokemon} in the given generation.\nThis error should not appear! Something VERY STRANGE has happened!`
              }
            ]
          }
        ]
      }
    });
  }

  if(!['Physical','Special','Status'].includes(category)) {
    return await respond({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        flags: InteractionResponseFlags.EPHEMERAL | InteractionResponseFlags.IS_COMPONENTS_V2,
        components: [
          {
            type: MessageComponentTypes.SECTION,
            accent_color: 0xCC0000,
            components: [
              {
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: `Invalid category: ${category}`
              }
            ]
          }
        ]
      }
    });
  }

  const buttons = components.BUTTON_BAR.components.map(button => ({
    ...button,
    disabled: category === button.label,
  }));

  return respond({
    type: InteractionResponseType.UPDATE_MESSAGE,
    data: {
      components: [
        {
          type: MessageComponentTypes.CONTAINER,
          id: componentIDs.ROOT,
          accent_color: components.ROOT.accent_color,
          components: [
            {
              type: MessageComponentTypes.TEXT_DISPLAY,
              id: componentIDs.TITLE,
              content: `# ${pokemon['name']}'s moveset: (${category})`
            },
            {
              type: MessageComponentTypes.TEXT_DISPLAY,
              id: componentIDs.ONE_CATEGORY_LIST,
              content: (await listMoves(data, pokemon, restriction))
              .filter(el => el.category === category)
              .sort()
              .map(el => pokemon.types.includes(el.type) && el.category !== 'Status' ? `**${el.name}**` : el.name)
              .join(', ')
            },
            {
              type: MessageComponentTypes.TEXT_DISPLAY,
              id: componentIDs.NOTES,
              content: `### Notes\n- A move displayed with **Bold text** benefits from Same-Type Attack Bonus when used by ${pokemon.name}.`
            },
            {
              type: MessageComponentTypes.ACTION_ROW,
              id: componentIDs.BUTTON_BAR,
              components: buttons
            },
            {
              type: MessageComponentTypes.ACTION_ROW,
              components: [
                components.TERA
              ]
            }
          ]
        }
      ],
      flags: InteractionResponseFlags.IS_COMPONENTS_V2
    },
  });
}

function reformatMovelist(data, types, movelist, teraType) {
  if(!movelist) {
    return undefined;
  }

  const moves = movelist.split(', ');

  return moves.map((el) => {
    const move = data.moves.get(el);

    if(move.category === 'Status') {
      return move.name;
    }
    if(types.includes(move.type) && move.type === teraType?.name) {
      return `__**${move.name}**__`;
    } else if(types.includes(move.type)) {
      return `**${move.name}**`;
    } else if(move.type === teraType?.name) {
      return `__${move.name}__`;
    } else {
      return move.name;
    }
  }).join(', ');
}

function processTera(interaction, respond) {
  const data = gens.data['championsnatdex'];
  const components = getComponentsById(interaction.message, componentIDs);
  const title = components.TITLE;
  const pokemon = data.species.get(title.content.slice(2, title.content.lastIndexOf('\'')));
  const teraType = data.types.get(interaction.data.values[0]);

  const notes = [`- A move displayed with **Bold text** benefits from Same-Type Attack Bonus when used by ${pokemon.name}.`];
  if(teraType?.name) {
    notes.push(`- A move displayed with __Underlined text__ benefits from Same-Type Attack Bonus when used by a Pokémon Terastalised as a ${teraType.name}-type.`);
  }

  const singleList = components.ONE_CATEGORY_LIST;
  const moveLists = singleList ? [
    {
      type: MessageComponentTypes.TEXT_DISPLAY,
      id: componentIDs.ONE_CATEGORY_LIST,
      content: reformatMovelist(data, pokemon.types, singleList.content, teraType)
    }
  ] : [
    components.PHYSICAL_LIST,
    components.SPECIAL_LIST,
    components.STATUS_LIST
  ].map(({id, type, content}) => ({
    id,
    type,
    content: content.split('\n').map((el, index) => {
      if(index === 1) {
        return reformatMovelist(data, pokemon.types, el, teraType);
      } else {
        return el
      }
    }).join('\n')
  }));

  return respond({
    type: InteractionResponseType.UPDATE_MESSAGE,
    data: {
      flags: InteractionResponseFlags.IS_COMPONENTS_V2,
      components: [
        {
          type: MessageComponentTypes.CONTAINER,
          id: componentIDs.ROOT,
          accent_color: components.ROOT.accent_color,
          components: [
            title,
            ...moveLists,
            {
              type: MessageComponentTypes.TEXT_DISPLAY,
              id: componentIDs.NOTES,
              content: `### Notes\n${notes.join('\n')}`
            },
            ...[components.BUTTON_BAR].filter(el => !!el),
            {
              type: MessageComponentTypes.ACTION_ROW,
              components: [components.TERA]
            }
          ]
        }
      ]
    },
  });
}

export default process;

