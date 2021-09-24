'use strict';

const Dex = require('@pkmn/dex');
const Data = require('@pkmn/data');

const dataSearch = require('datasearch');
const { getargs } = require('discord-getarg');
const buildEmbed = require('embed-builder');

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
        embeds: [buildEmbed({
          title: "Error",
          description: `Could not find a Pokémon named ${args.name} in Generation ${Dex.Dex.gen}.`,
          color: 0xCC0000,
        })],
        flags: 1 << 6,
      },
    });
    return;
  }

  const learnset = await data.learnsets.get(pokemon['id']);

  let title = '';
  let description = '';
  if(!args.event) {
    title = `${pokemon['name']} has ${learnset['eventData'].length} events.`;
    if(learnset['eventData'].length > 0) {
      description = `\nInclude an Event ID for more information (1-${learnset['eventData'].length})`;
    }
  } else if (args.event < 1 || args.event > learnset['eventData'].length) {
    res.json({
      type: 4,
      data: {
        embeds: [buildEmbed({
          title: "Error",
          description: `${pokemon.name} only has ${learnset.eventData.length} events.`,
          color: 0xCC0000,
        })],
        flags: 1 << 6,
      },
    });
    return;
  } else {
    const eventData = learnset['eventData'][args.event - 1];
    title += `${pokemon['name']} (Event #${args.event})\n`;
    description += `Generation ${eventData['generation']}; Level ${eventData['level']}\n`;
    description += `Poke Ball: ${eventData.pokeball ? data.items.get(eventData.pokeball).name : '-'}; `;
    description += `Gender: ${(eventData.gender || 'Random')}; Nature: ${(eventData.nature || 'Random')}\n`;
    description += `Hidden Ability: ${eventData.isHidden ? 'Yes' : 'No'}; Shiny: ${eventData.shiny ? 'Yes' : 'No'}\n`;

    if(eventData['ivs']) {
      description += `IVs: `;
      ['HP', 'Atk', 'Def', 'SpA', 'SpD', 'Spe'].forEach((el) => {
        if(eventData['ivs'][el] || eventData['ivs'][el] === 0) {
          description += `${eventData['ivs'][el]} ${el}; `;
        }
      });
      description += `\n`;
    }

    if(eventData['perfectIVs']) {
      description += `Guaranteed at least ${eventData['perfectIVs']} perfect IVs.\n`;
    }

    description += `Moves:\n`;
    eventData['moves'].forEach((el) => {
      description += ` - ${data.moves.get(el).name}\n`;
    });
  }

  res.json({
    type: 4,
    data: {
      embeds: [buildEmbed({
        title,
        description,
      })],
    },
  });
};

module.exports = {command, process};

