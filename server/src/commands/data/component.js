import { InteractionResponseFlags, InteractionResponseType } from 'discord-interactions';

import { dt, getData } from '#utils/dt-formatter';
import { buildError } from '#utils/embed-builder';
import gens from '#utils/gen-db';

async function process(interaction, respond) {
  console.log({'interaction': JSON.stringify(interaction.message.interaction), 'metadata': JSON.stringify(interaction.message.interaction_metadata)});
  const isAuthor = (interaction.member?.user ?? interaction.user).id === interaction.message.interaction_metadata.user_id;

  const [ id, gen, verboseArg, componentEffect ] = interaction.data.custom_id.split('|');
  const [ itemEffect ] = interaction.data.values?.[0].split('|') ?? [];

  const effectType = itemEffect ?? componentEffect;

  const verbose = !!verboseArg;

  const effect = getData(gens.data[gen], id).filter(e=>e.effectType === effectType)[0];

  const result = dt[effectType](effect, gen, verboseArg);

  if(!isAuthor) {
    result.components = [];
  }

  return respond({
    type: isAuthor ? InteractionResponseType.UPDATE_MESSAGE : InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      ...result,
      flags: isAuthor ? 0 : InteractionResponseFlags.EPHEMERAL,
    }
  });
};

export default process;

