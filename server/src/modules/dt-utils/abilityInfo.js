import { InteractionResponseFlags } from 'discord-interactions';

import { buildEmbed } from 'embed-builder';
import gens from 'gen-db';

function abilityInfo(ability, gen, verbose) {
  return {
    embeds: [buildEmbed({
      title: `Ability: ${ability['name']}`,
      description: ability['desc'],
    })],
  };
}

export default abilityInfo;
