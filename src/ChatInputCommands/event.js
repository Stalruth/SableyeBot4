'use strict';

const Dex = require('@pkmn/dex');
const Data = require('@pkmn/data');

const dataSearch = require('datasearch');
const { getargs } = require('discord-getarg');

const command = {
  description: 'Return the number of events a Pokemon has or the details of a specific event.',
  options: [
    {
      name: 'name',
      type: 3,
      description: 'Name of the Pokémon',
      required: true,
    },
    {
      name: 'event',
      type: 4,
      description: 'ID of the event.',
    },
  ],
};

const process = async function(req, res) {
  const args = getargs(req.body).params;

  const data = new Data.Generations(Dex.Dex).get(Dex.Dex.gen);

  const pokemon = dataSearch(data.species, Data.toID(args.name))?.result;

  if(!pokemon) {
    res.json({
      type: 4,
      data: {
        embeds: [{
          title: "Error",
          description: `Could not find a Pokémon named ${args.name} in Generation ${Dex.Dex.gen}.`,
          color: 0xCC0000,
          footer: {
            text: `SableyeBot version 4.0.0-alpha`,
            icon_url: 'https://cdn.discordapp.com/avatars/211522070620667905/6b037c17fc6671f0a5dc73803a4c3338.webp',
          },
        }],
        flags: 1 << 6,
      },
    });
    return;
  }

  const learnset = await data.learnsets.get(pokemon['id']);

  let title = '';
  let reply = '';
  if(!args.event || args.event < 1 || args.event > learnset['eventData'].length) {
    title = `${pokemon['name']} has ${learnset['eventData'].length} events.`;
    if(learnset['eventData'].length > 0) {
      reply = `\nInclude an Event ID for more information (1-${learnset['eventData'].length})`;
    }
  } else {
    const eventData = learnset['eventData'][args.event - 1];
    title += `${pokemon['name']} (Event #${args.event})\n`;
    reply += `Generation ${eventData['generation']}; Level ${eventData['level']}\n`;
    reply += `Poke Ball: ${eventData.pokeball ? data.items.get(eventData.pokeball).name : '-'}; `;
    reply += `Gender: ${(eventData.gender || 'Random')}; Nature: ${(eventData.nature || 'Random')}\n`;
    reply += `Hidden Ability: ${eventData.isHidden ? 'Yes' : 'No'}; Shiny: ${eventData.shiny ? 'Yes' : 'No'}\n`;

    if(eventData['ivs']) {
      reply += `IVs: `;
      ['HP', 'Atk', 'Def', 'SpA', 'SpD', 'Spe'].forEach((el) => {
        if(eventData['ivs'][el] || eventData['ivs'][el] === 0) {
          reply += `${eventData['ivs'][el]} ${el}; `;
        }
      });
      reply += `\n`;
    }

    if(eventData['perfectIVs']) {
      reply += `Guaranteed at least ${eventData['perfectIVs']} perfect IVs.\n`;
    }

    reply += `Moves:\n`;
    eventData['moves'].forEach((el) => {
      reply += ` - ${data.moves.get(el).name}\n`;
    });
  }

  res.json({
    type: 4,
    data: {
      embeds: [{
        title,
        description: reply,
        color: 0x5F32AB,
        footer: {
          text: `SableyeBot version 4.0.0-alpha`,
          icon_url: 'https://cdn.discordapp.com/avatars/211522070620667905/6b037c17fc6671f0a5dc73803a4c3338.webp',
        },
      }],
    },
  });
};

module.exports = {command, process};

