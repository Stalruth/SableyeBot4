import { InteractionResponseFlags, InteractionResponseType } from 'discord-interactions';

import getargs from 'discord-getarg';
import { dt, getData } from 'dt-utils';
import { buildEmbed, buildError } from 'embed-builder';
import gens from 'gen-db';
import { completeAll, getAutocompleteHandler } from 'pokemon-complete';

const definition = {
  description: 'Return information on the given Pokemon, Ability, Move, Item, or Nature.',
  options: [
    {
      name: 'name',
      type: 3,
      description: 'Name of the Pokemon, Ability, Move, Item, or Nature to look up.',
      required: true,
      autocomplete: true,
    },
    {
      name: 'verbose',
      type: 5,
      description: 'Return extra information.',
    },
    {
      name: 'gen',
      type: 3,
      description: 'The Generation to check against.',
      choices: gens.names,
    },
  ],
};

async function process(interaction) {
  const args = getargs(interaction);
  const { params } = args;

  const data = gens.data[params.gen ? params.gen : 'natdex'];

  const results = getData(data, params.name);

  if(results.length === 0) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [buildError(`Could not find a result matching ${params.name} in the given generation.`)],
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    };
  }
  
  if(results.length === 1) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: dt[results[0].effectType](results[0], data.num, params.verbose),
    };
  }

  if(results.length === 2) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [buildEmbed({
          title: "Disambiguation",
          description: `There are multiple results matching ${params.name}.  Please pick the entity you are looking up below.`,
        })],
        components: [{
          type: 1,
          components: [{
            type: 3,
            custom_id: `${results[0].id}|${params.gen ?? 'natdex'}|${params.verbose ? 'true' : ''}`,
            options: results.map(entity => ({
              label: entity.effectType,
              value: entity.effectType,
            })),
          }],
        }]
      },
    };
  }
};

const autocomplete = {
  name: getAutocompleteHandler(completeAll, 'name'),
};

export default {
  definition,
  command: {
    process,
    autocomplete,
  }
};

