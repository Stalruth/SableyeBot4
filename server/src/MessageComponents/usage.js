import { InteractionResponseFlags, InteractionResponseType } from 'discord-interactions';

import formatter from '#utils/usage-formatter';
import { buildError } from '#utils/embed-builder';

async function process(interaction, respond) {
  const isAuthor = (interaction.member?.user ?? interaction.user).id === interaction.message.interaction.user.id;

  const [format, pokemon, field] = interaction.data.custom_id.split('|');

  const fields = [
    {
      name: 'Abilities',
      field: 'abilities',
    },
  ];

  if(field === 'moves') {
    fields.push({name: 'Moves', field});
  } else if(field === 'items') {
    fields.push({name: 'Items', field});
  } else if(field === 'spreads') {
    fields.push({name: 'Spreads', field});
  } else if(field === 'teammates') {
    fields.push({name: 'Teammates', field});
  }

  const response = await formatter(format, pokemon, fields);

  return respond({
    type: isAuthor ? InteractionResponseType.UPDATE_MESSAGE : InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      ...response,
      components: isAuthor ? response.components : [],
      flags: isAuthor ? 0 : InteractionResponseFlags.EPHEMERAL,
    }
  });
}

export default process;
