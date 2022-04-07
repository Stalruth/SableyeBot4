import { InteractionResponseFlags, InteractionResponseType } from 'discord-interactions';
import Data from '@pkmn/data';

import getargs from 'discord-getarg';
import { buildEmbed, buildError } from 'embed-builder';
import decodeSource from 'learnsetutils';
import gens from 'gen-db';
import colours from 'pokemon-colours';
import { completePokemon, completeMove, getMultiComplete, getAutocompleteHandler } from 'pokemon-complete';

const definition = {
  description: 'Returns the learnset of the Pokémon given, or how it learns a given move.',
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

async function listMoves(data, pokemon, restriction) {
  const learnables = await data.learnsets.learnable(pokemon.id, restriction);

  const learnsets = [];
  for await (const l of data.learnsets.all(pokemon)) {
    learnsets.push(l);
  }

  const description = Object.keys(learnables)
    .filter(id => learnsets.map(l => l['learnset']?.[id])
        .flat()
        .filter(source => !!source)
        .filter(source => !restriction || (source.startsWith(String(data.num)) && !source.endsWith('V')))
        .length > 0
    )
    .map(id=>data.moves.get(id))
    .filter(el=>!!el)
    .sort()
    .join(', ');

  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      embeds: [buildEmbed({
        title: `${pokemon['name']}'s moveset:\n`,
        description,
        color: colours.types[Data.toID(pokemon.types[0])]
      })],
    },
  };
}

function getPrevo(data, pokemon, stages) {
  let currentStage = pokemon;
  for(let i = 0; i < stages; i++) {
    const nextId = currentStage.battleOnly ??
        (Data.toID(currentStage.baseSpecies) === currentStage.id ? currentStage.prevo : currentStage.baseSpecies);
    currentStage = data.species.get(nextId);
  }
  return currentStage;
}

async function checkMove(data, pokemon, move) {
  const finalSources = [];
  let latestGen = 0;
  let loopCount = -1;
  for await (const learnset of data.learnsets.all(pokemon)) {
    loopCount++;
    const sources = (learnset?.learnset?.[move.id] ?? []).filter(el => {
        return Number(el[0] <= data.num);
    });

    if(!sources.length) {
      continue;
    }

    if(Number(sources[0][0]) < data.num) {
      latestGen = Number(sources[0][0]);
      continue;
    }

    const currentStage = getPrevo(data, pokemon, loopCount);

    finalSources.push(...sources.filter(el=>Number(el[0]) === data.num)
        .map(el => `- As ${currentStage.name} ${decodeSource(el)}`));
  }

  if(finalSources.length) {
    return {
      name: `${move.name}:`,
      value: finalSources.join('\n'),
    };
  } else if (latestGen > 0) {
    return {
      name: `${move.name}`,
      value: `- when transferred from Generation ${latestGen}`,
    }; 
  } else {
    return {
      name: `${move.name}:`,
      value: `- ${pokemon.name} does not learn ${move.name} in Generation ${data.num}`,
    };
  }
}

const process = async function(interaction) {
  const args = getargs(interaction).params;

  const vgcNotes = [,,,,,'Pentagon','Plus','Galar'];

  const data = gens.data[args.gen ? args.gen : 'natdex'];

  const pokemon = data.species.get(Data.toID(args.pokemon));

  if(!pokemon?.exists) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [
          buildError(`Could not find a Pokémon named ${args.pokemon} in the given generation.`)
        ],
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    };
  }

  const restriction = args.mode === 'vgc' ? vgcNotes[data.num - 1] : undefined;

  if(!args.moves) {
    return await listMoves(data, pokemon, restriction);
  }

  const moves = args.moves.split(',').map(e=>data.moves.get(e));

  if(moves.some(e=>e === undefined)) {
    const invalidMoves = [];
    moves.forEach((e,i) => {
      if(e === undefined) {
        invalidMoves.push(args.moves.split(',')[i]);
      }
    });
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [
          buildError(`Could not find ${invalidMoves.length === 1 ? 'a ' : ''}move${invalidMoves.length > 1 ? 's ' : ''} named ${invalidMoves.join(', ')}${args.gen ? ` in Generation ${args.gen}` : ''}.`)
        ],
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    };
  }

  const fields = await Promise.all(moves.map(async (move) => {
    return await checkMove(data, pokemon, move);
  }));

  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      embeds: [buildEmbed({
        title: pokemon.name,
        fields,
        color: colours.types[Data.toID(pokemon.types[0])],
      })],
    },
  };

};

const autocomplete = {
  pokemon: getAutocompleteHandler(completePokemon, 'pokemon'),
  moves: getAutocompleteHandler(completeMove, 'moves'),
};

export default {
  definition,
  command: {
    process,
    autocomplete,
  }
};

