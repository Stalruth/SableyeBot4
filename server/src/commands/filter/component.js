import { ButtonStyleTypes, InteractionResponseFlags, InteractionResponseType, MessageComponentTypes } from 'discord-interactions';
import fetch from 'node-fetch';

import db from './db-service.js';
import { buildEmbed, buildError } from '#utils/embed-builder';

async function getPage(interaction, respond) {
  const isAuthor = (interaction.member?.user ?? interaction.user).id === interaction.message.interaction.user.id;

  const pageNumber = parseInt(interaction.data.custom_id, 10);
  if(!pageNumber || isNaN(pageNumber)) {
    return respond({
      type: InteractionResponseType.DEFERRED_UPDATE_MESSAGE,
    });
  }

  const pages = db.getFilterCollection().findOne({interactionId: interaction.message.interaction.id})?.pages;

  // cache miss
  if(!pages) {
    respond({
      type: InteractionResponseType.UPDATE_MESSAGE,
      data: {
        embeds: interaction.message.embeds,
        components: []
      },
    });

    await fetch(`https://discord.com/api/v10/webhooks/${interaction.application_id}/${interaction.token}`,
      {
        method: 'POST',
        body: JSON.stringify({
          embeds: [
            buildError('This command execution has expired, please run it again.')
          ],
          flags: InteractionResponseFlags.EPHEMERAL,
        }),
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': `DiscordBot (https://github.com/Stalruth/SableyeBot4, v${process.env.npm_package_version})`,
        },
      }
    );
    return;
  }

  const fields = interaction.message.embeds[0].fields.map(field => {
    if(field.name.startsWith('Results')) {
      return {
        name: field.name,
        value: pages[pageNumber - 1],
      };
    }
    return field;
  });

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

  return respond({
    type: isAuthor ? InteractionResponseType.UPDATE_MESSAGE : InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      components: isAuthor ? [
        {
          type: MessageComponentTypes.ACTION_ROW,
          components: pageList.map(page => ({
            type: MessageComponentTypes.BUTTON,
            custom_id: page === pageNumber ? '-' : `${page}`,
            disabled: page === pageNumber,
            style: ButtonStyleTypes.SECONDARY,
            label: `Page ${page}`,
          }))
        }
      ] : [],
      embeds: [buildEmbed({
        fields: fields,
      })],
      flags: isAuthor ? 0 : InteractionResponseFlags.EPHEMERAL,
    },
  });
}

export default getPage;
