import { ButtonStyleTypes, InteractionResponseFlags, InteractionResponseType, MessageComponentTypes } from 'discord-interactions';

import { buildEmbed, buildError } from '#utils/embed-builder';
import gens from '#utils/gen-db';
import { listMoves } from '#utils/learnset-utils';

async function process(interaction, respond) {
  const isAuthor = (interaction.member?.user ?? interaction.user).id === interaction.message.interaction.user.id;
  if(!isAuthor) {
    return respond({
      type: InteractionResponseType.UPDATE_MESSAGE,
    });
  }

  if(interaction.data.custom_id === 'tera') {
    return processTera(interaction, respond);
  }

  processCategory(interaction, respond);
}

async function processCategory(interaction, respond) {
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

  const embed = buildEmbed({
    color: interaction.message.embeds[0].color,
    title: `${pokemon.name}'s moveset: (${category})`,
    description: (await listMoves(data, pokemon, restriction))
      .filter(el => el.category === category)
      .sort()
      .map(el => pokemon.types.includes(el.type) && el.category !== 'Status' ? `**${el.name}**` : el.name)
      .join(', '),
    fields: [{
      name: 'Notes',
      value: `A move displayed with **Bold text** benefits from Same-Type Attack Bonus when used by ${pokemon.name}.`,
    }],
  });

  const buttons = interaction.message.components[0].components.map(button => ({
    ...button,
    disabled: category === button.label,
  }));

  return respond({
    type: InteractionResponseType.UPDATE_MESSAGE,
    data: {
      components: [
        {
          type: MessageComponentTypes.ACTION_ROW,
          components: buttons,
        },
        interaction.message.components[1],
      ],
      embeds: [embed],
      flags: 0,
    },
  });
}

function reformatMovelist(data, types, movelist, teraType) {
  if(!movelist) {
    return undefined;
  }

  const moves = movelist.split(', ');

  return moves.map((el) => {
    const move = data.moves.get(el);

    if(move.category === 'Status') {
      return move.name;
    }
    if(types.includes(move.type) && move.type === teraType?.name) {
      return `__**${move.name}**__`;
    } else if(types.includes(move.type)) {
      return `**${move.name}**`;
    } else if(move.type === teraType?.name) {
      return `__${move.name}__`;
    } else {
      return move.name;
    }
  }).join(', ');
}

function processTera(interaction, respond) {
  const embed = interaction.message.embeds[0];
  const data = gens.data['natdex'];
  const title = embed.title;
  const moveFields = embed.fields.slice(0, -1);
  const pokemon = data.species.get(title.slice(0, title.lastIndexOf('\'')));
  const teraType = data.types.get(interaction.data.values[0]);

  const notes = [`A move displayed with **Bold text** benefits from Same-Type Attack Bonus when used by ${pokemon.name}.`];
  if(teraType?.name) {
    notes.push(`A move displayed with __Underlined text__ benefits from Same-Type Attack Bonus when used by a Pokémon Terastalised as a ${teraType.name}-type.`);
  }

  const noteField = {
    name: 'Notes',
    value: notes.join('\n'),
  };

  const results = buildEmbed({
    color: embed.color,
    title,
    description: reformatMovelist(data, pokemon.types, embed.description, teraType),
    fields: [
      ...moveFields.map(el => ({
        name: el.name,
        value: reformatMovelist(data, pokemon.types, el.value, teraType),
      })),
      noteField,
    ],
  });

  return respond({
    type: InteractionResponseType.UPDATE_MESSAGE,
    data: {
      embeds: [results],
      flags: InteractionResponseFlags.EPHEMERAL,
      components: interaction.message.components,
    },
  });
}

export default process;

