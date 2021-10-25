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
          description: `Could not find a Pokémon named ${args.name}.`,
          color: 0xCC0000,
        })],
        flags: 1 << 6,
      },
    };
  }

  const learnset = await natDexData.learnsets.get(pokemon['id']);

  let title = '';
  let description = '';
  const fields = [];
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

    fields.push(
      {
        name: 'Generation',
        value: eventData.generation,
        inline: true,
      },
      {
        name: 'Level',
        value: eventData.level,
        inline: true,
      },
    );
    if(eventData.pokeball) {
      fields.push(
        {

          name: 'Poké Ball',
          value: eventData.pokeball,
          inline: true,
        }
      );
    }
    fields.push(
      {
        name: 'Gender',
        value: eventData.gender ?? 'Random',
        inline: true,
      },
      {
        name: 'Nature',
        value: eventData.nature ?? 'Random',
        inline: true,
      },
      {
        name: 'Hidden Ability',
        value: eventData.isHidden ? 'Yes' : 'No',
        inline: true,
      },
      {
        name: 'Shiny',
        value: eventData.shiny ? 'Yes' : 'No',
        inline: true,
      },
    );

    if(eventData['perfectIVs']) {
      fields.push({
        name: 'Perfect IVs',
        value: eventData.perfectIVs,
        inline: true,
      });
    }

    if(eventData['ivs']) {
      fields.push({
        name: 'IVs',
        value: ['HP', 'Atk', 'Def', 'SpA', 'SpD', 'Spe'].map((el) => {
          if(eventData['ivs'][el.toLowerCase()] || eventData['ivs'][el.toLowerCase()] === 0) {
            return `${eventData['ivs'][el.toLowerCase()]} ${el}`;
          }
          return undefined;
        }).filter(el => !!el).join('; '),
      });
    }

    fields.push({
      name: 'Moves',
      value: eventData['moves'].map(el=>natDexData.moves.get(el).name).join(', '),
    });
  }

  return {
    type: 4,
    data: {
      embeds: [buildEmbed({
        title,
        description,
        fields,
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

