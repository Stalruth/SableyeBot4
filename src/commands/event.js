'use strict';

const Dex = require('@pkmn/dex');
const Data = require('@pkmn/data');

const dataSearch = require('datasearch');
const getarg = require('discord-getarg');

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
  const name = getarg(req.body, 'name').value;
  const eventId = getarg(req.body, 'event')?.value ?? null;

  const gen = Dex.Dex.gen;
  const data = new Data.Generations(Dex.Dex).get(gen);

  const pokemon = dataSearch(data.species, Data.toID(name))?.result;

  if(!pokemon) {
    res.json({
      type: 4,
      data: {
        content: `Could not find a Pokémon named ${name} in Generation ${gen}.`,
        flags: 1 << 6,
      },
    });
    return;
  }

  const learnset = await data.learnsets.get(pokemon['id']);

  let reply = '';
  if(eventId === null || eventId < 1 || eventId > learnset['eventData'].length) {
    reply = `${pokemon['name']} has ${learnset['eventData'].length} events.`;
    if(learnset['eventData'].length > 0) {
      reply += `\nInclude an Event ID for more information (1-${learnset['eventData'].length})`;
    }
  } else {
    const eventData = learnset['eventData'][eventId - 1];
    reply += `${pokemon['name']} (Event #${eventId})\n`;
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

