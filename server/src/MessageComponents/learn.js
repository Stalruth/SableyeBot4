import { ButtonStyleTypes, InteractionResponseFlags, InteractionResponseType, MessageComponentTypes } from 'discord-interactions';

import { buildError } from 'embed-builder';
import gens from 'gen-db';
import { listMoves } from 'learnsetutils';

async function process(interaction, respond) {
  if((interaction.member?.user ?? interaction.user).id !== interaction.message.interaction.user.id) {
    return respond({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [
          buildError('Only the person who ran the command may change the page it displays.')
        ],
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    });
  }

  const [pokemonId, category, gen, restrictionId] = interaction.data.custom_id.split('|');
  const data = gens.data[gen] ?? gens.data['natdex'];
  const pokemon = data.species.get(pokemonId);
  const restriction = restrictionId ? undefined : restrictionId;

  if(!pokemon?.exists) {
    return await respond({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [
          buildError(`Could not find a Pokémon named ${args.pokemon} in the given generation.`)
        ],
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    });
  }

  if(!['Physical','Special','Status'].includes(category)) {
    return await respond({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [
          buildError(`Invalid category: ${category}.`)
        ],
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    });
  }

  const embed = interaction.message.embeds[0];
  embed.title = `${pokemon.name}'s moveset: (${category})`;
  embed.description = (await listMoves(data, pokemon, restriction))
      .filter(el => el.category === category)
      .sort()
      .map(el => pokemon.types.includes(el.type) && el.category !== 'Status' ? `**${el.name}**` : el.name)
      .join(', ')

  const buttons = interaction.message.components[0].components.map(button => ({
    ...button,
    disabled: category === button.label,
  }));

  return respond({
    type:  InteractionResponseType.UPDATE_MESSAGE,
    data: {
      embeds: [embed],
      components: [
        {
          type: MessageComponentTypes.ACTION_ROW,
          components: buttons,
        },
      ],
    },
  });
}

export default process;
