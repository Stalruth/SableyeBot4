import { ButtonStyleTypes, InteractionResponseFlags, InteractionResponseType, MessageComponentTypes } from 'discord-interactions';
import Data from '@pkmn/data';

import getargs from '#utils/discord-getarg';
import { buildEmbed, buildError } from '#utils/embed-builder';
import gens from '#utils/gen-db';
import { decodeSource, listMoves, getPrevo, checkMove } from '#utils/learnset-utils';
import colours from '#utils/pokemon-colours';
import { completePokemon, completeMove, getMultiComplete, getAutocompleteHandler } from '#utils/pokemon-complete';

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
      name: 'mode',
      type: 3,
      description: 'Exclude previous generations in accordance with VGC rules',
      choices: [
        {
          name: 'VGC',
          value: 'vgc',
        },
        {
          name: 'Default',
          value: 'smogon',
        },
      ],
    },
    {
      name: 'gen',
      type: 3,
      description: 'The Generation to check against.',
      choices: gens.names,
    },
  ],
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

  const threshold = 1024; // Maximum length of an Embed Field Value.
  const allThreshold = 2048;

  const allLength = moveLists['Physical'].length + moveLists['Special'].length
    + moveLists['Status'].length;

  const maxLength = Math.max(moveLists['Physical'].length, 
    moveLists['Special'].length, moveLists['Status'].length);

  const fields = [
    {
      name: 'Note',
      value: `A move displayed with **Bold text** benefits from Same-Type Attack Bonus when used by ${pokemon.name}.`,
    },
  ]

  if(allLength > allThreshold || maxLength > threshold) {
    // split
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [buildEmbed({
          title: `${pokemon['name']}'s moveset: (Physical)`,
          description: moveLists['Physical'],
          fields,
          color: colours.types[Data.toID(pokemon.types[0])],
        })],
        components: [
          {
            type: MessageComponentTypes.ACTION_ROW,
            components: ['Physical','Special','Status'].map(category => ({
              type: MessageComponentTypes.BUTTON,
              custom_id: `${pokemon.id}|${category}|${gen ?? ''}|${restriction ?? ''}`,
              disabled: category === 'Physical',
              style: ButtonStyleTypes.SECONDARY,
              label: category,
            }))
          },
        ]
      },
    };
  }

  fields.unshift(
    {
      name: 'Physical Moves',
      value: moveLists['Physical'],
    },
    {
      name: 'Special Moves',
      value: moveLists['Special'],
    },
    {
      name: 'Status Moves',
      value: moveLists['Status'],
    },
  );

  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      embeds: [buildEmbed({
        title: `${pokemon['name']}'s moveset:`,
        fields,
        color: colours.types[Data.toID(pokemon.types[0])]
      })],
    },
  };
}

async function learnPokemonMove(data, pokemon, moves, restriction, gen) {
  const fields = await Promise.all(moves.map(async (move) => {
    return await checkMove(data, pokemon, move);
  }));

  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      embeds: [buildEmbed({
        title: `[${gen ?? 'Latest Gen'}] ${pokemon.name}`,
        fields,
        color: colours.types[Data.toID(pokemon.types[0])],
      })],
    },
  };
}

async function process(interaction, respond) {
  const args = getargs(interaction).params;

  const vgcNotes = [,,,,,'Pentagon','Plus','Galar'];

  const data = gens.data[args.gen ? args.gen : 'natdex'];

  const pokemon = data.species.get(Data.toID(args.pokemon));

  if(!pokemon?.exists) {
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

  const restriction = args.mode === 'vgc' ? vgcNotes[data.num - 1] : undefined;

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
        embeds: [
          buildError(`Could not find ${invalidMoves.length === 1 ? 'a move' : 'moves'} named ${invalidMoves.join(', ')}${args.gen ? ` in Generation ${args.gen}` : ''}.`)
        ],
        flags: InteractionResponseFlags.EPHEMERAL,
      },
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

