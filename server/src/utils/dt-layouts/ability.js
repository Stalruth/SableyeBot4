import { InteractionResponseFlags } from 'discord-interactions';

import { buildEmbed } from '#utils/embed-builder';
import gens from '#utils/gen-db';

function abilityInfo(ability, gen, verbose) {
  return {
    embeds: [buildEmbed({
      title: `Ability: ${ability['name']}`,
      description: ability['desc'],
    })],
  };
}

export default abilityInfo;
