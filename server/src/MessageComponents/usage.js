import { InteractionResponseFlags, InteractionResponseType } from 'discord-interactions';

import formatter from 'usage-formatter';
import { buildError } from 'embed-builder';

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

  return respond({
    type:  InteractionResponseType.UPDATE_MESSAGE,
    data: await formatter(format, pokemon, fields),
  });
}

export default process;
