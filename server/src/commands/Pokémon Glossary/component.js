import { InteractionResponseFlags, InteractionResponseType } from 'discord-interactions';

import { dt, getData } from '#utils/dt-formatter';
import { buildError } from '#utils/embed-builder';
import gens from '#utils/gen-db';
import { getComponentsById } from '#utils/get-component';
import isInteractionStarter from '#utils/isInteractionStarter';

import { componentIDs } from './components-index.js';

async function process(interaction, respond) {
  const components = getComponentsById(interaction.message, componentIDs);

  let effectType = '';
  let id = '';
  let page = '';
  let gen = '';

  if(interaction.data.custom_id === '-') {
    [ effectType, id ] = interaction.data.values?.[0].split('|') ?? [];
    console.log(interaction.data.values?.[0]);
  } else {
    let componentEffect = '';
    [ id, gen, page, componentEffect ] = interaction.data.custom_id.split('|');
    const [ itemEffect ] = interaction.data.values?.[0].split('|') ?? [];
    effectType = itemEffect ?? componentEffect;
  }

  const effect = getData(gens.data['championsnatdex'], id).filter(e=>e.effectType === effectType)[0];

  const result = dt[effectType](effect, 'championsnatdex', page);

  result['components'][0]['components'].unshift(components.DISAM_DROPDOWN);

  return respond({
    type: InteractionResponseType.UPDATE_MESSAGE,
    data: result
  });
};

export default process;

