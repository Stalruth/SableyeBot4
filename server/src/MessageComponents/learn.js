import { ButtonStyleTypes, InteractionResponseFlags, InteractionResponseType, MessageComponentTypes } from 'discord-interactions';

import { buildError } from '#utils/embed-builder';
import gens from '#utils/gen-db';
import { listMoves } from '#utils/learnset-utils';

async function process(interaction, respond) {
  const isAuthor = (interaction.member?.user ?? interaction.user).id === interaction.message.interaction.user.id;

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
    type: isAuthor ? InteractionResponseType.UPDATE_MESSAGE : InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      components: isAuthor ? [
        {
          type: MessageComponentTypes.ACTION_ROW,
          components: buttons,
        },
      ] : [],
      embeds: [embed],
      flags: isAuthor ? 0 : InteractionResponseFlags.EPHEMERAL,
    },
  });
}

export default process;
