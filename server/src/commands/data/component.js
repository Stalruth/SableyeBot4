import { InteractionResponseFlags, InteractionResponseType, MessageComponentTypes } from 'discord-interactions';

import { dt, getData } from '#utils/dt-formatter';
import { buildError } from '#utils/embed-builder';
import gens from '#utils/gen-db';
import { getComponentsById } from '#utils/get-component';
import isInteractionStarter from '#utils/isInteractionStarter';

import { componentIDs } from '#utils/dt-layouts/component-index';

async function process(interaction, respond) {
  const isAuthor = isInteractionStarter(interaction);
  const components = getComponentsById(interaction.message, componentIDs);

  const [ id, gen, page, componentEffect ] = interaction.data.custom_id.split('|');
  const [ itemEffect ] = interaction.data.values?.[0].split('|') ?? [];

  const effectType = itemEffect ?? componentEffect;

  const effect = getData(gens.data[gen], id).filter(e=>e.effectType === effectType)[0];

  const result = dt[effectType](effect, gen, page);

  if(isAuthor) {
    if(components.DISAM_BUTTONS) {
      result['components'][0]['components'].unshift({
        type: MessageComponentTypes.ACTION_ROW,
        id: componentIDs.DISAM_BUTTONS,
        components: components.DISAM_BUTTONS.components.map(el => {
          if(el.label === effectType) {
            return {...el, disabled: true}
          } else {
            return {...el, disabled: false}
          }
        })
      });
    }
    else if(components.DISAM_DROPDOWN) {
      result['components'][0]['components'].unshift(components.DISAM_DROPDOWN);
    }
  }

  return respond({
    type: isAuthor ? InteractionResponseType.UPDATE_MESSAGE : InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      ...result,
      flags: isAuthor ? result.flags : result.flags | InteractionResponseFlags.EPHEMERAL,
    }
  });
};

export default process;

