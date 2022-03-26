'use strict';

const { InteractionResponseFlags, InteractionResponseType } = require('discord-interactions');
const fetch = require('node-fetch');

const db = require('db-service');
const { buildEmbed, buildError } = require('embed-builder');

async function getPage(interaction, respond) {
  if((interaction.member?.user ?? interaction.user).id !== interaction.message.interaction.user.id) {
    return respond({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [
          buildError('Only the person who ran the command may change the page it displays.')
        ],
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    });
  }

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

  const pageList = pages.length <= 5 ?
    new Array(pages.length)
      .fill(0)
      .map((e,i)=>i+1)
    :
    [...(new Set([
      1,
      Math.max(pageNumber - 1, 1),
      pageNumber,
      Math.min(pageNumber + 1, pages.length),
      pages.length
    ]))];

  return respond({
    type: InteractionResponseType.UPDATE_MESSAGE,
    data: {
      embeds: [buildEmbed({
        fields: fields,
      })],
      components: [
        {
          type: 1,
          components: pageList.map(page => ({
            type: 2,
            custom_id: page === pageNumber ? '-' : `${page}`,
            disabled: page === pageNumber,
            style: 2,
            label: `Page ${page}`,
          }))
        }
      ],
    },
  });
}

module.exports = getPage;
