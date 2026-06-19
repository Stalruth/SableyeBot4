import { ButtonStyleTypes, InteractionResponseFlags, InteractionResponseType, MessageComponentTypes } from 'discord-interactions';
import Data from '@pkmn/data';

import getargs from '#utils/discord-getarg';
import { buildEmbed, buildError } from '#utils/embed-builder';
import gens from '#utils/gen-db';
import { decodeSource, listMoves, getPrevo, checkMove } from '#utils/learnset-utils';
import colours from '#utils/pokemon-colours';
import { completePokemon, completeMove, getMultiComplete, getAutocompleteHandler } from '#utils/pokemon-complete';

import { componentIDs } from './component-index.js';

const definition = {
  description: 'Display the learnset of the Pokémon given, or how it learns a given move.',
  options: [
    {
      name: 'pokemon',
      type: 3,
      description: 'Name of the Pokémon',
      required: true,
      autocomplete: true,
    },
    {
      name: 'moves',
      type: 3,
      description: 'Moves to check, separated by commas',
      autocomplete: true,
    },
    {
      name: 'vgc',
      type: 5,
      description: 'Exclude moves learned via transfer in accordance with VGC rules',
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

async function learnPokemon(data, pokemon, restriction, gen) {
  const moveList = (await listMoves(data, pokemon, restriction));
  const moveLists = {
    'Physical': moveList.filter(el => el.category === 'Physical')
      .sort()
      .map(el => pokemon.types.includes(el.type) ? `**${el.name}**` : el.name)
      .join(', '),
    'Special': moveList.filter(el => el.category === 'Special')
      .sort()
      .map(el => pokemon.types.includes(el.type) ? `**${el.name}**` : el.name)
      .join(', '),
    'Status': moveList.filter(el => el.category === 'Status')
      .sort()
      .map(el => el.name)
      .join(', '),
  };

  const threshold = 2048;

  const allLength = moveLists['Physical'].length + moveLists['Special'].length
    + moveLists['Status'].length;

  const maxLength = Math.max(moveLists['Physical'].length,
    moveLists['Special'].length, moveLists['Status'].length);


  const types = [];
  for(let type of data.types) {
    types.push({
      label: type.name,
      value: type.id,
    });
  }

  const teraRow = (data.num !== 9 || data.dex.baseMod !== 'base') ? [] : [
    {
      type: MessageComponentTypes.ACTION_ROW,
      components: [
        {
          type: MessageComponentTypes.STRING_SELECT,
          id: componentIDs.TERA,
          custom_id: 'tera',
          options: [
            {
              label: 'Clear Tera Type',
              value: 'reset',
            },
            ...types,
          ],
        }
      ],
    },
  ];

  if(allLength > threshold) {
    // split
    console.log(componentIDs.TITLE)
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        flags: 1 << 15,
        components: [
          {
            type: 17,
            id: componentIDs.ROOT,
            accent_color: colours.types[Data.toID(pokemon.types[0])],
            components: [
              {
                type: 10,
                id: componentIDs.TITLE,
                content: `# ${pokemon['name']}'s moveset: (Physical)`
              },
              {
                type: 10,
                id: componentIDs.ONE_CATEGORY_LIST,
                content: moveLists['Physical']
              },
              {
                type: 10,
                id: componentIDs.NOTES,
                content: `### Notes\n- A move displayed with **Bold text** benefits from Same-Type Attack Bonus when used by ${pokemon.name}.`
              },
              {
                type: MessageComponentTypes.ACTION_ROW,
                id: componentIDs.BUTTON_BAR,
                components: ['Physical','Special','Status'].map(category => ({
                  type: MessageComponentTypes.BUTTON,
                  custom_id: `${pokemon.id}|${category}|${gen ?? ''}|${restriction ?? ''}`,
                  disabled: category === 'Physical',
                  style: ButtonStyleTypes.SECONDARY,
                  label: category,
                }))
              },
              ...teraRow,
            ]
          }
        ]
      }
    };
  }

  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      flags: 1 << 15,
      components: [
        {
          type: 17,
          id: 1,
          accent_color: colours.types[Data.toID(pokemon.types[0])],
          components: [
            {
              type: 10,
              id: componentIDs.TITLE,
              content: `# ${pokemon['name']}'s moveset:`
            },
            {
              type: 10,
              id: componentIDs.PHYSICAL_LIST,
              content: `### Physical:\n${moveLists['Physical']}`
            },
            {
              type: 10,
              id: componentIDs.SPECIAL_LIST,
              content: `### Special:\n${moveLists['Special']}`
            },
            {
              type: 10,
              id: componentIDs.STATUS_LIST,
              content: `### Status:\n${moveLists['Status']}`
            },
            {
              type: 10,
              id: componentIDs.NOTES,
              content: `### Notes\n- A move displayed with **Bold text** benefits from Same-Type Attack Bonus when used by ${pokemon.name}.`
            },
            ...teraRow
          ]
        },
      ],
    },
  };
}

async function learnPokemonMove(data, pokemon, moves, restriction, gen) {
  const moveComponents = await Promise.all(moves.map(async (move) => {
    return await checkMove(data, pokemon, move);
  }));

  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      flags: InteractionResponseFlags.IS_COMPONENTS_V2,
      components: [
        {
          type: MessageComponentTypes.CONTAINER,
          accent_color: colours.types[Data.toID(pokemon.types[0])],
          components: [
            {
              type: MessageComponentTypes.TEXT_DISPLAY,
              content: `# [${gen ?? 'Latest Gen'}] ${pokemon.name}`
            },
            ...moveComponents
          ]
        }
      ]
    },
  };
}

async function process(interaction, respond) {
  const args = getargs(interaction).params;
  const vgcNotes = [,,,,,'Pentagon','Plus','Galar','Paldea'];
  const data = gens.data[args.gen ? args.gen : 'natdex'];
  const pokemon = data.species.get(Data.toID(args.pokemon));

  if(!pokemon?.exists) {
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

  const restriction = args.vgc ? vgcNotes[data.num - 1] : undefined;

  if(!args.moves) {
    return await respond(await learnPokemon(data, pokemon, restriction, args.gen));
  }

  const moves = args.moves.split(',').map(e=>data.moves.get(e));

  if(moves.some(e=>e === undefined)) {
    const invalidMoves = [];
    moves.forEach((e,i) => {
      if(e === undefined) {
        invalidMoves.push(args.moves.split(',')[i]);
      }
    });
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
                content: `Could not find ${invalidMoves.length === 1 ? 'a move' : 'moves'} named ${invalidMoves.join(', ')}${args.gen ? ` in Generation ${args.gen}` : ''}.`
              }
            ]
          }
        ]
      }
    });
  }

  return await respond(await learnPokemonMove(data, pokemon, moves, restriction, args.gen))
};

const autocomplete = {
  pokemon: getAutocompleteHandler(completePokemon, 'pokemon'),
  moves: getAutocompleteHandler(getMultiComplete(gens.data['natdex'].moves, completeMove, {canNegate: false, canRepeat: false}), 'moves'),
};

export default {
  definition,
  command: {
    process,
    autocomplete,
  }
};

