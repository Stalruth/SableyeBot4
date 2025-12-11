import { InteractionResponseFlags, InteractionResponseType } from 'discord-interactions';

import { dt, getData } from '#utils/dt-formatter';
import { buildError } from '#utils/embed-builder';
import gens from '#utils/gen-db';
import { getComponentsById } from '#utils/get-component';
import isInteractionStarter from '#utils/isInteractionStarter';

import { componentIDs } from './components-index.js';

async function process(interaction, respond) {
  const components = getComponentsById(interaction.message, componentIDs);

  const [ effectType, id ] = interaction.data.values?.[0].split('|') ?? [];

  const effect = getData(gens.data['natdex'], id).filter(e=>e.effectType === effectType)[0];

  const result = dt[effectType](effect, 'natdex');

  result['components'][0]['components'].unshift(components.DISAM_DROPDOWN);

  return respond({
    type: InteractionResponseType.UPDATE_MESSAGE,
    data: result
  });
};

export default process;

