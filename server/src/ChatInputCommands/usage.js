import { InteractionResponseFlags, InteractionResponseType } from 'discord-interactions';

import getargs from 'discord-getarg';
import formatter from 'usage-formatter';
import { buildError } from 'embed-builder';
import { completePokemon, getAutocompleteHandler } from 'pokemon-complete';

const definition = {
  description: 'Display usage statistics of a given Pokémon in a given metagame.',
  options: [
    {
      name: 'format',
      type: 3,
      description: 'Format to search.',
      required: true,
      choices: [
        {
          name: 'OU',
          value: 'OU',
        },
        {
          name: 'Ubers',
          value: 'Ubers',
        },
        {
          name: 'UU',
          value: 'UU',
        },
        {
          name: 'RU',
          value: 'RU',
        },
        {
          name: 'NU',
          value: 'NU',
        },
        {
          name: 'LC',
          value: 'LC',
        },
        {
          name: 'Doubles OU',
          value: 'Doubles OU',
        },
        {
          name: 'Doubles UU',
          value: 'Doubles UU',
        },
        {
          name: 'VGC 2022',
          value: 'VGC 2022',
        },
      ],
    },
    {
      name: 'pokemon',
      type: 3,
      description: 'Pokémon to search.',
      required: true,
      autocomplete: true,
    },
  ],
};

async function process(interaction, respond) {
  const args = getargs(interaction).params;

  try {
    return await respond({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: await formatter(`[Gen 8] ${args['format']}`, args['pokemon'], [
        {
          name: 'Abilities',
          field: 'abilities',
        },
        {
          name: 'Moves',
          field: 'moves',
        }
      ])
    });
  } catch (e) {
    return await respond({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [
          buildError(`There is no data for ${args['pokemon']} in ${args['format']}`),
        ],
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    });
  }
};

const autocomplete = {
  pokemon: getAutocompleteHandler(completePokemon, 'pokemon'),
};

export default {
  definition,
  command: {
    process,
    autocomplete,
  },
};

