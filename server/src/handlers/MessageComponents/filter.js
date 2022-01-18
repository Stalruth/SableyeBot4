'use strict';

const { InteractionResponseFlags, InteractionResponseType } = require('discord-interactions');
const db = require('db-service');

const buildEmbed = require('embed-builder');

async function getPage(interaction) {
  if(interaction.member.user.id !== interaction.message.interaction.user.id) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [buildEmbed({
          title: "Error",
          description: 'Only the person who ran the command may change the page it displays.',
          color: 0xCC0000,
        })],
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    };
  }

  const pageNumber = parseInt(interaction.data.custom_id, 10);
  if(!pageNumber || isNaN(pageNumber)) {
    return {
      type: InteractionResponseType.DEFERRED_UPDATE_MESSAGE,
    };
  }

  const pages = db.filters.findOne({interactionId: interaction.message.interaction.id})?.pages;

  // cache miss
  if(!pages) {
    return {
      type: InteractionResponseType.UPDATE_MESSAGE,
      data: {
        embeds: interaction.message.embeds,
        components: []
      },
    };
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

  const pageList = [...(new Set([
    1,
    Math.max(pageNumber - 1, 1),
    pageNumber,
    Math.min(pageNumber + 1, pages.length),
    pages.length
  ]))];

  return {
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
  };
}

module.exports = getPage;
