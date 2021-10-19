'use strict';

const Data = require('@pkmn/data');
const Dex = require('@pkmn/dex');

const dataSearch = require('datasearch');
const getargs = require('discord-getarg');
const buildEmbed = require('embed-builder');
const natDexData = require('natdexdata');
const colours = require('pkmn-colours');
const { completePokemon } = require('pkmn-complete');

const command = {
  description: 'Return the number of events a Pokemon has or the details of a specific event.',
  options: [
    {
      name: 'name',
      type: 3,
      description: 'Name of the Pokémon',
      required: true,
      autocomplete: true,
    },
    {
      name: 'event',
      type: 4,
      description: 'ID of the event.',
    },
  ],
};

const process = async function(interaction) {
  const args = getargs(interaction).params;

  const pokemon = dataSearch(natDexData.species, Data.toID(args.name))?.result;

  if(!pokemon) {
    return {
      type: 4,
      data: {
        embeds: [buildEmbed({
          title: "Error",
          description: `Could not find a Pokémon named ${args.name} in Generation ${Dex.Dex.gen}.`,
          color: 0xCC0000,
        })],
        flags: 1 << 6,
      },
    };
  }

  const learnset = await natDexData.learnsets.get(pokemon['id']);

  let title = '';
  let description = '';
  if(!args.event) {
    title = `${pokemon['name']} has ${learnset['eventData']?.length ?? 'no'} events.`;
    if(learnset['eventData']?.length) {
      description = `\nInclude an Event ID for more information (1-${learnset['eventData'].length})`;
    }
  } else if (args.event < 1 || args.event > learnset['eventData'].length) {
    return {
      type: 4,
      data: {
        embeds: [buildEmbed({
          title: "Error",
          description: `${pokemon.name} only has ${learnset.eventData.length} events.`,
          color: 0xCC0000,
        })],
        flags: 1 << 6,
      },
    };
  } else {
    const eventData = learnset['eventData'][args.event - 1];
    title += `${pokemon['name']} (Event #${args.event})\n`;
    description += `Generation ${eventData['generation']}; Level ${eventData['level']}\n`;
    description += `Poke Ball: ${eventData.pokeball ? Dex.Dex.items.get(eventData.pokeball).name : '-'}; `;
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
      description += ` - ${natDexData.moves.get(el).name}\n`;
    });
  }

  return {
    type: 4,
    data: {
      embeds: [buildEmbed({
        title,
        description,
        color: colours.types[Data.toID(pokemon.types[0])]
      })],
    },
  };
};

function autocomplete(interaction) {
  const args = getargs(interaction).params;
  return {
    type: 8,
    data: {
      choices: completePokemon(args['name']),
    },
  };
}

module.exports = {command, process, autocomplete};

