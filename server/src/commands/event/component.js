import { ButtonStyleTypes, InteractionResponseFlags, InteractionResponseType, MessageComponentTypes } from 'discord-interactions';

import { buildEmbed, buildError } from '#utils/embed-builder';
import gens from '#utils/gen-db';
import isInteractionStarter from '#utils/isInteractionStarter';

async function process(interaction, respond) {
  const isAuthor = isInteractionStarter(interaction);

  // TODO: handle more like /filter
  if(!isAuthor) {
    return respond({
      type: InteractionResponseType.UPDATE_MESSAGE,
    });
  }

  const words = interaction.message.embeds[0].title.split(' ');
  const suffix = words[words.length - 3] === 'has' ? 3 : 6;
  const pokemonName = words.slice(0, suffix).join(' ');
  const pokemon = gens['natdex'].species.get(pokemonName);
  if(!pokemon) {
    return await respond({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [
          buildError(`Could not find a Pokémon named ${args.pokemon}.`)
        ],
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    });
  }
  const learnset = await gens.data['natdex'].learnsets.get(pokemon['id']);

  if(interaction.data.custom_id === 'generation') {
    const generationNumber = Number(interaction.data.values[0]);
    const eventIDs = [];
    learnset.eventData.forEach((ele, ind) => {
      if(ele.generation === generationNumber) {
        eventIDs.push(ind + 1);
      }
    });

    const title = `${pokemon.name} has ${eventIDs.length} events in Generation ${generationNumber}`;
    const description = `Use the buttons below to browse the events, or use the dropdown to select a different Generation.`;

    // TODO this
    const buttons = {}

    return await respond({
      type: InteractionResponseType.UPDATE_MESSAGE,
      data: {
        embeds: [buildEmbed({
          title,
          description,
          color: colurs.types[Data.toID(pokemon.types[0])]
        })],
        components: [
          {
            type: 
          }
        ]
      }
    });
  }


  return respond({
    type: InteractionResponseType.UPDATE_MESSAGE,
  });
}

export default process;

