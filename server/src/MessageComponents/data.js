import { InteractionResponseFlags, InteractionResponseType } from 'discord-interactions';

import getargs from 'discord-getarg';
import { dt, getData } from 'dt-utils';
import { buildError } from 'embed-builder';
import gens from 'gen-db';

async function process(interaction, respond) {
  const isAuthor = (interaction.member?.user ?? interaction.user).id === interaction.message.interaction.user.id;

  const [ idOne, gen, verboseArg ] = interaction.data.custom_id.split('|');
  const [ effectType, idTwo ] = interaction.data.values[0].split('|');

  const id = idTwo ?? idOne;

  const verbose = !!verboseArg;

  const effect = getData(gens.data[gen], id).filter(e=>e.effectType === effectType)[0];

  const result = dt[effectType](effect, gen, verboseArg);

  result.components = [];

  return respond({
    type: isAuthor ? InteractionResponseType.UPDATE_MESSAGE : InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      ...result,
      flags: isAuthor ? 0 : InteractionResponseFlags.EPHEMERAL,
    }
  });
};

export default process;

