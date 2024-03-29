import { InteractionResponseFlags, InteractionResponseType, MessageComponentTypes } from 'discord-interactions';

import getargs from '#utils/discord-getarg';
import { dt, getData } from '#utils/dt-formatter';
import { buildEmbed, buildError } from '#utils/embed-builder';
import gens from '#utils/gen-db';
import { completeAll, getAutocompleteHandler } from '#utils/pokemon-complete';

const definition = {
  description: 'Display information on the given Pokemon, Ability, Move, Item, or Nature.',
  options: [
    {
      name: 'name',
      type: 3,
      description: 'Name of the Pokemon, Ability, Move, Item, or Nature to look up.',
      required: true,
      autocomplete: true,
    },
    {
      name: 'gen',
      type: 3,
      description: 'The Generation to check against.',
      choices: gens.names,
    },
  ],
  integration_types: [0, 1],
  contexts: [0, 1, 2]
};

async function process(interaction, respond) {
  const args = getargs(interaction);
  const { params } = args;
  const gen = params.gen ?? 'natdex';

  const data = gens.data[gen];

  const results = getData(data, params.name);

  if(results.length === 0) {
    return respond({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [buildError(`Could not find a result matching ${params.name} in the given generation.`)],
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    });
  }

  if(results.length === 1) {
    return respond({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: dt[results[0].effectType](results[0], params.gen ?? 'natdex'),
    });
  }

  return respond({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      embeds: [buildEmbed({
        title: "Disambiguation",
        description: `There are multiple results matching ${params.name}.  Please pick the entity you are looking up below.`,
      })],
      components: [{
        type: MessageComponentTypes.ACTION_ROW,
        components: [{
          type: MessageComponentTypes.STRING_SELECT,
          custom_id: `${results[0].id}|${params.gen ?? 'natdex'}|true`,
          options: results.map(entity => ({
            label: entity.effectType,
            value: entity.effectType,
          })),
        }],
      }]
    },
  });
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

