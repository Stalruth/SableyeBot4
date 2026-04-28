import { InteractionResponseFlags, InteractionResponseType, MessageComponentTypes } from 'discord-interactions';

import getargs from '#utils/discord-getarg';
import gens from '#utils/gen-db';
import colours from '#utils/pokemon-colours';
import { completePokemon, completeType, getMultiComplete, getAutocompleteHandler } from '#utils/pokemon-complete';

const typeNotes = [
  {
    note: 'are immune to effects that prevent Switching.',
    gens: [6,7,8,9],
    types: ['ghost'],
  },
  {
    note: 'are immune to Powder-based Moves.',
    gens: [6,7,8,9],
    types: ['grass'],
  },
  {
    note: 'cannot be Burned by Fire-type Moves.',
    gens: [2],
    types: ['fire'],
  },
  {
    note: 'cannot be Burned.',
    gens: [3,4,5,6,7,8,9],
    types: ['fire'],
  },
  {
    note: 'cannot be Frozen by Ice-type Moves.',
    gens: [2],
    types: ['ice'],
  },
  {
    note: 'cannot be Frozen.',
    gens: [3,4,5,6,7,8,9],
    types: ['ice'],
  },
  {
    note: 'cannot be paralyzed.',
    gens: [6,7,8,9],
    types: ['electric'],
  },
  {
    note: 'cannot be Poisoned by Poison-type Moves.',
    gens: [2],
    types: ['poison','steel'],
  },
  {
    note: 'cannot be Poisoned.',
    gens: [1,3,4,5,6,7,8,9],
    types: ['poison','steel'],
  },
  {
    note: 'take no damage from Hail.',
    gens: [2,3,4,5,6,7,8],
    types: ['ice'],
  },
  {
    note: 'have their Defense increased by 50% in Snow.',
    gens: [9],
    types: ['ice'],
  },
  {
    note: 'take no damage from Sandstorm.',
    gens: [2,3,4,5,6,7,8,9],
    types: ['ground','rock','steel'],
  },
  {
    note: 'have their Special Defense increased by 50% in a Sandstorm.',
    gens: [4,5,6,7,8,9],
    types: ['rock'],
  },
];

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
  integration_types: [0, 1],
  contexts: [0, 1, 2]
};

async function process(interaction, respond) {
  const args = getargs(interaction).params;

  const data = gens.data[args.gen ? args.gen : 'natdex'];

  if(!args.pokemon && !args.types) {
    return await respond({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        flags: InteractionResponseFlags.EPHEMERAL | InteractionResponseFlags.IS_COMPONENTS_V2,
        components: [
          {
            type: MessageComponentTypes.CONTAINER,
            accent_color: 0xCC0000,
            components: [
              {
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: `Please provide a Pokémon and/or Types.`
              }
            ]
          }
        ]
      }
    });
  }

  const pokemon = data.species.get(args.pokemon);

  if(args.pokemon && !pokemon?.exists) {
    return await respond({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        flags: InteractionResponseFlags.EPHEMERAL | InteractionResponseFlags.IS_COMPONENTS_V2,
        components: [
          {
            type: MessageComponentTypes.CONTAINER,
            accent_color: 0xCC0000,
            components: [
              {
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: `Could not find a Pokémon named ${args.pokemon} in the given generation.`
              }
            ]
          }
        ]
      }
    });
  }

  const argTypes = (args.types ?? '')
      .split(',')
      .filter(el => el.length)
      .map((el) => {
        return data.types.get(el)?.name;
      });

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
        flags: InteractionResponseFlags.EPHEMERAL | InteractionResponseFlags.IS_COMPONENTS_V2,
        components: [
          {
            type: MessageComponentTypes.CONTAINER,
            accent_color: 0xCC0000,
            components: [
              {
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: `Could not find Type(s) named ${nonTypes.join(',')} in the given generation.`
              }
            ]
          }
        ]
      }
    });
  }

  const types = [...new Set([...(pokemon?.types ?? []), ...argTypes])];

  if(types.length > 3) {
    return await respond({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        flags: InteractionResponseFlags.EPHEMERAL | InteractionResponseFlags.IS_COMPONENTS_V2,
        components: [
          {
            type: MessageComponentTypes.CONTAINER,
            accent_color: 0xCC0000,
            components: [
              {
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: `Only three types total can be used with this command.`
              }
            ]
          }
        ]
      }
    });
  }

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
    if(i.id === 'stellar') {
      continue;
    }
    eff[i.totalEffectiveness(types)].push(i.name);
  }

  const names = {
    0: 'No effect',
    0.125: 'Almost Ineffective (0.125x)',
    0.25: 'Almost Ineffective',
    0.5: 'Not very effective',
    1: 'Neutral damage',
    2: 'Super Effective',
    4: 'Extremely Effective',
    8: 'Extremely Effective (8x)',
  };

  for(const i of [0, 0.125, 0.25, 0.5, 1, 2, 4, 8]) {
    if(eff[i].length === 0) { continue; }
    fields.push({
      type: MessageComponentTypes.TEXT_DISPLAY,
      content: `### ${names[i]}\n${eff[i].join(', ')}`,
    });
  }

  const notes = [];

  typeNotes.forEach(note => {
    if(!note.gens.includes(data.num)) { return; }

    const affectedTypes = types.filter(type => note.types.includes(type.toLowerCase()));
    if(!affectedTypes.length) { return; }

    const lastType = `**${affectedTypes.pop()}**-`;
    const firstTypes = affectedTypes.map(el => `**${el}**-`).join(', ');
    notes.push(`- ${!firstTypes.length ? '' : `${firstTypes} and `}${lastType}types ${note.note}`);
  });

  if(notes.length > 0) {
    fields.push({
      type: MessageComponentTypes.TEXT_DISPLAY,
      content: `### Type Notes\n${notes.join('\n')}`,
    });
  }

  let title = pokemon ? `# ${pokemon.name} [${pokemon.types.join('/')}] ` : `# \\- `
  if(args.pokemon && args.types) {
    title += '+ ';
  }
  if(args.types) {
    title += `[${argTypes.join('/')}]`
  }

  return await respond({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      flags: InteractionResponseFlags.IS_COMPONENTS_V2,
      components: [
        {
          type: MessageComponentTypes.CONTAINER,
          accent_color: colours.types[data.types.get(types[0]).id],
          components: [
            {
              type: MessageComponentTypes.TEXT_DISPLAY,
              content: title
            },
            ...fields
          ]
        }
      ]
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
