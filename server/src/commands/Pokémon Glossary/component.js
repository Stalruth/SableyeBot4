import { InteractionResponseFlags, InteractionResponseType } from 'discord-interactions';

import { dt, getData } from '#utils/dt-formatter';
import { buildError } from '#utils/embed-builder';
import gens from '#utils/gen-db';
import isInteractionStarter from '#utils/isInteractionStarter';

async function process(interaction, respond) {
  const isAuthor = isInteractionStarter(interaction);

  const [ effectType, id ] = interaction.data.values?.[0].split('|') ?? [];

  const effect = getData(gens.data['natdex'], id).filter(e=>e.effectType === effectType)[0];

  const result = dt[effectType](effect, 'natdex');

  result.components = interaction.message.components;

  return respond({
    type: isAuthor ? InteractionResponseType.UPDATE_MESSAGE : InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      ...result,
      flags: isAuthor ? 0 : InteractionResponseFlags.EPHEMERAL,
    }
  });
};

export default process;

