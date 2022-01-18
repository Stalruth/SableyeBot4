'use strict';

const { InteractionResponseFlags, InteractionResponseType } = require('discord-interactions');
const Data = require('@pkmn/data');

const getargs = require('discord-getarg');
const buildEmbed = require('embed-builder');
const gens = require('gen-db');
const colours = require('pkmn-colours');
const { completePokemon } = require('pkmn-complete');

const command = {
  description: 'Return the number of events a Pokémon has or the details of a specific event.',
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
      description: 'ID of the event, starting at 1.',
      min_value: 1,
    },
  ],
};

const process = async function(interaction) {
  const args = getargs(interaction).params;

  const pokemon = gens.data['gen8natdex'].species.get(Data.toID(args.name));

  if(!pokemon) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [buildEmbed({
          title: "Error",
          description: `Could not find a Pokémon named ${args.name}.`,
          color: 0xCC0000,
        })],
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    };
  }

  const learnset = await gens.data['gen8natdex'].learnsets.get(pokemon['id']);
  const event = args.event ?? learnset.eventData?.length === 1 ? 1 : undefined;

  if(!event) {
    const description = learnset['eventData']?.length ? `Include an Event ID for more information (1-${learnset['eventData'].length})` : '';
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [buildEmbed({
          title: `${pokemon['name']} has ${learnset['eventData']?.length ?? 'no'} events.`,
          description,
          color: colours.types[Data.toID(pokemon.types[0])]
        })],
      },
    };
  }


  let title = '';
  const fields = [];
  if (event < 1 || event > learnset['eventData']?.length) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [buildEmbed({
          title: "Error",
          description: `${pokemon.name} only has ${learnset.eventData.length} event${learnset.eventData.length !== 1 ? 's' : ''}.`,
          color: 0xCC0000,
        })],
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    };
  }

  const eventData = learnset['eventData'][event - 1];
  title += `${pokemon['name']} (Event #${event})\n`;

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
    value: eventData['moves'].map(el=>gens.data['gen8natdex'].moves.get(el).name).join(', '),
  });

  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      embeds: [buildEmbed({
        title,
        fields,
        color: colours.types[Data.toID(pokemon.types[0])]
      })],
    },
  };
};

function autocomplete(interaction) {
  const args = getargs(interaction).params;
  return {
    type: InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
    data: {
      choices: completePokemon(args['name']),
    },
  };
}

module.exports = {command, process, autocomplete};

