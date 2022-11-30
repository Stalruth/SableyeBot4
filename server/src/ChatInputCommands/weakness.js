import { InteractionResponseFlags, InteractionResponseType } from 'discord-interactions';

import getargs from '#utils/discord-getarg';
import { buildEmbed, buildError } from '#utils/embed-builder';
import gens from '#utils/gen-db';
import colours from '#utils/pokemon-colours';
import { completePokemon, completeType, getMultiComplete, getAutocompleteHandler } from '#utils/pokemon-complete';

const definition = {
  description: 'Weaknesses based on a given Pokémon and/or types.',
  options: [
    {
      name: 'pokemon',
      type: 3,
      description: 'Pokémon to check the weaknesses of.',
      autocomplete: true,
    },
    {
      name: 'types',
      type: 3,
      description: 'Types to check the weaknesses of, separated by commas. (maximum 3)',
      autocomplete: true,
    },
    {
      name: 'gen',
      type: 3,
      description: 'The Generation used to calculate against.',
      choices: gens.names,
    },
  ],
};

async function process(interaction, respond) {
  const args = getargs(interaction).params;

  const data = gens.data[args.gen ? args.gen : 'natdex'];

  if(!args.pokemon && !args.types) {
    return await respond({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [
          buildError(`Could not find Type(s) named ${nonTypes.join(',')} in Generation ${args.gen}.`,)
        ],
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    });
  }

  const pokemon = data.species.get(args.pokemon);

  if(args.pokemon && !pokemon?.exists) {
    return await respond({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [
          buildError(`Could not find a Pokémon named ${args.pokemon} in the given generation.`)
        ],
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    });
  }

  const argTypes = (args.types ?? '')
      .split(',')
      .filter(el => el.length)
      .map((el) => {
        return data.types.get(el)?.name;
      });

  console.log(argTypes);

  if(argTypes.some((el) => {return !el;})) {
    let nonTypes = [];
    for(const i in argTypes) {
      if(!argTypes[i]) {
        nonTypes.push(args.types.split(',')[i]);
      }
    }

    return await respond({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [
          buildError(`Could not find Type(s) named ${nonTypes.join(',')} in Generation ${args.gen}.`,)
        ],
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    });
  }

  const types = [...new Set([...pokemon.types, ...argTypes])];

  if(types.length > 3) {
    return await respond({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [
          buildError(`Only three types total can be used with this command.`,)
        ],
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    });
  }

  let title = `${pokemon?.name ?? '-'}${args.pokemon && args.types ? '+' : ''} [${types.join('/')}]`;
  let fields = [];

  const eff = {
    0: [],
    0.125: [],
    0.25: [],
    0.5: [],
    1: [],
    2: [],
    4: [],
    8: [],
  };

  for(const i of data.types) {
    eff[i.totalEffectiveness(types)].push(i.name);
  }
  
  const names = {
    0: 'Immune',
    0.125: 'Resists (0.125x)',
    0.25: 'Resists (0.25x)',
    0.5: 'Resists (0.5x)',
    1: 'Neutral damage',
    2: 'Weak (2x)',
    4: 'Weak (4x)',
    8: 'Weak (8x)',
  };

  for(const i of [0, 0.125, 0.25, 0.5, 1, 2, 4, 8]) {
    if(eff[i].length === 0) { continue; }
    fields.push({
      name: names[i],
      value: eff[i].join(', '),
    });
  }

  return await respond({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      embeds: [buildEmbed({
        title,
        fields,
        color: colours.types[data.types.get(types[0]).id]
      })]
    },
  });
}

const autocomplete = {
  'pokemon': getAutocompleteHandler(completePokemon, 'pokemon'),
  'types': getAutocompleteHandler(getMultiComplete(gens.data['natdex'].types, completeType, {canNegate: false, canRepeat: false}), 'types'),
};

export default {
  definition,
  command: {
    process,
    autocomplete
  }
};
