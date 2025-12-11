import { ButtonStyleTypes, InteractionResponseFlags, InteractionResponseType, MessageComponentTypes } from 'discord-interactions';

import db from './db-service.js';
import { buildEmbed, buildError } from '#utils/embed-builder';
import { getComponentsById } from '#utils/get-component';
import isInteractionStarter from '#utils/isInteractionStarter';

import { componentIDs } from './component-index.js';

async function getPage(interaction, respond) {
  const isAuthor = isInteractionStarter(interaction);

  const pageNumber = parseInt(interaction.data.custom_id, 10);
  if(!pageNumber || isNaN(pageNumber)) {
    return respond({
      type: InteractionResponseType.DEFERRED_UPDATE_MESSAGE,
    });
  }

  const pages = db.getFilterCollection().findOne({interactionId: interaction.message.interaction_metadata.id})?.pages;
  const components = getComponentsById(interaction.message, componentIDs);

  // cache miss
  if(!pages) {
    respond({
      type: InteractionResponseType.UPDATE_MESSAGE,
      data: {
        flags: InteractionResponseFlags.IS_COMPONENTS_V2,
        components: [
          {
            type: MessageComponentTypes.CONTAINER,
            accent_color: 0x5F32AB,
            id: componentIDs.ROOT,
            components: components.ROOT.components.filter(el => el.id != componentIDs.BUTTON_BAR)
          }
        ]
      },
    });

    await fetch(`https://discord.com/api/v10/webhooks/${interaction.application_id}/${interaction.token}`,
      {
        method: 'POST',
        body: JSON.stringify({
          flags: InteractionResponseFlags.EPHEMERAL | InteractionResponseFlags.IS_COMPONENTS_V2,
          components: [
            {
              type: MessageComponentTypes.CONTAINER,
              accent_color: 0xCC0000,
              components: [
                {
                  type: MessageComponentTypes.TEXT_DISPLAY,
                  content: 'This command has expired, please run it again.'
                }
              ]
            }
          ]
        }),
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': `DiscordBot (https://github.com/Stalruth/SableyeBot4, v${process.env.npm_package_version})`,
        },
      }
    );
    return;
  }

  const results = `${components.RESULTS.content.split('\n')[0]}\n${pages[pageNumber - 1]}`;

  const threePages = [];

  if(pageNumber < 3) {
    threePages.push(2,3,4);
  } else if(pageNumber > pages.length - 2) {
    threePages.push(pages.length - 3, pages.length - 2, pages.length - 1);
  } else {
    threePages.push(pageNumber - 1, pageNumber, pageNumber + 1);
  }

  const pageList = pages.length <= 5 ?
    new Array(pages.length)
      .fill(0)
      .map((e,i)=>i+1)
    :
    [...(new Set([
      1,
      ...threePages.map(el=>Math.min(Math.max(1, el), pages.length)),
      pages.length
    ]))];

  const resultComponents = [
    components.FILTERS,
    {
      type: MessageComponentTypes.TEXT_DISPLAY,
      id: componentIDs.RESULTS,
      content: results
    },
    ...(!isAuthor ? [] : [
      {
        type: MessageComponentTypes.ACTION_ROW,
        id: componentIDs.BUTTON_BAR,
        components: pageList.map(page => ({
          type: MessageComponentTypes.BUTTON,
          custom_id: page === pageNumber ? '-' : `${page}`,
          disabled: page === pageNumber,
          style: ButtonStyleTypes.SECONDARY,
          label: `Page ${page}`,
        }))
      }
    ]),
    components.NOTES
  ]

  return respond({
    type: isAuthor ? InteractionResponseType.UPDATE_MESSAGE : InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      components: [
        {
          type: MessageComponentTypes.CONTAINER,
          accent_color: 0x5F32AB,
          id: componentIDs.ROOT,
          components: resultComponents
        }
      ],
      flags: (isAuthor ? 0 : InteractionResponseFlags.EPHEMERAL) | InteractionResponseFlags.IS_COMPONENTS_V2,
    },
  });
}

export default getPage;
