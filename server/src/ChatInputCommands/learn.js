import { InteractionResponseFlags, InteractionResponseType } from 'discord-interactions';
import Data from '@pkmn/data';

import getargs from 'discord-getarg';
import { buildEmbed, buildError } from 'embed-builder';
import { decodeSource, listMoves, getPrevo, checkMove } from 'learnsetutils';
import gens from 'gen-db';
import colours from 'pokemon-colours';
import { completePokemon, completeMove, getMultiComplete, getAutocompleteHandler } from 'pokemon-complete';

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
    return await respond({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [buildEmbed({
          title: `${pokemon['name']}'s moveset:\n`,
          description: await listMoves(data, pokemon, restriction),
          color: colours.types[Data.toID(pokemon.types[0])]
        })],
      },
    });
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

  const fields = await Promise.all(moves.map(async (move) => {
    return await checkMove(data, pokemon, move);
  }));

  return await respond({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      embeds: [buildEmbed({
        title: `[${args.gen ?? 'Latest Gen'}] ${pokemon.name}`,
        fields,
        color: colours.types[Data.toID(pokemon.types[0])],
      })],
    },
  });
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

