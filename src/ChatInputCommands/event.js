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
        content: `Could not find a Pokémon named ${args.name} in Generation ${Dex.Dex.gen}.`,
        flags: 1 << 6,
      },
    });
    return;
  }

  const learnset = await data.learnsets.get(pokemon['id']);

  let reply = '';
  if(!args.event || args.event < 1 || args.event > learnset['eventData'].length) {
    reply = `${pokemon['name']} has ${learnset['eventData'].length} events.`;
    if(learnset['eventData'].length > 0) {
      reply += `\nInclude an Event ID for more information (1-${learnset['eventData'].length})`;
    }
  } else {
    const eventData = learnset['eventData'][args.event - 1];
    reply += `${pokemon['name']} (Event #${args.event})\n`;
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
        content: reply,
      },
    });
};

module.exports = {command, process};

