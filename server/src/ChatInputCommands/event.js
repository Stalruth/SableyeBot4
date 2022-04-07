import { InteractionResponseFlags, InteractionResponseType } from 'discord-interactions';
import Data from '@pkmn/data';

import getargs from 'discord-getarg';
import { buildEmbed, buildError } from 'embed-builder';
import gens from 'gen-db';
import colours from 'pokemon-colours';
import { completePokemon, getAutocompleteHandler } from 'pokemon-complete';

const definition = {
  description: 'Return the number of events a Pokémon has or the details of a specific event.',
  options: [
    {
      name: 'pokemon',
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

  const pokemon = gens.data['natdex'].species.get(Data.toID(args.pokemon));

  if(!pokemon) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [
          buildError(`Could not find a Pokémon named ${args.pokemon}.`)
        ],
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    };
  }

  const learnset = await gens.data['natdex'].learnsets.get(pokemon['id']);
  const event = args.event ?? (learnset?.eventData?.length === 1 ? 1 : undefined);
  const eventCount = learnset?.eventData?.length ?? 0;

  if(!event) {
    const title = `${pokemon['name']} has ${eventCount > 0 ? eventCount : 'no'} event${ eventCount !== 1 ? 's' : ''}.`;
    const description = eventCount > 0 ? `Set the \`event\` option to a number between 1 and ${learnset.eventData.length} for more information.` : '';
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [buildEmbed({
          title,
          description,
          color: colours.types[Data.toID(pokemon.types[0])]
        })],
      },
    };
  }


  let title = '';
  const fields = [];
  if (event < 1 || event > eventCount) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [
          buildError(`${pokemon['name']}${eventCount !== 0 ? ' only' : ''} has ${eventCount > 0 ? eventCount : 'no'} event${ eventCount !== 1 ? 's' : ''}.`)
        ],
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
    value: eventData['moves'].map(el=>gens.data['natdex'].moves.get(el).name).join(', '),
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

const autocomplete = {
  pokemon: getAutocompleteHandler(completePokemon, 'pokemon'),
};

export default {
  definition,
  command: {
    process,
    autocomplete,
  }
};

