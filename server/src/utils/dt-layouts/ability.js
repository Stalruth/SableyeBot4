import { InteractionResponseFlags, MessageComponentTypes } from 'discord-interactions';


import { buildEmbed } from '#utils/embed-builder';
import gens from '#utils/gen-db';

function abilityInfo(ability) {
  return {
    embeds: [buildEmbed({
      title: `Ability: ${ability['name']}`,
      description: ability['desc'],
    })],
  };
}

export default abilityInfo;
