'use strict';

const { InteractionResponseFlags, InteractionResponseType } = require('discord-interactions');
const Data = require('@pkmn/data');

const getargs = require('discord-getarg');
const { buildEmbed, buildError } = require('embed-builder');
const decodeSource = require('learnsetutils');
const gens = require('gen-db');
const colours = require('pokemon-colours');
const { completePokemon, completeMove } = require('pokemon-complete');

const definition = {
  description: 'Returns the learnset of the Pokémon given, or how it learns a given move.',
  options: [
    {
      name: 'name',
      type: 3,
      description: 'Name of the Pokémon',
      required: true,
      autocomplete: true,
    },
    {
      name: 'move',
      type: 3,
      description: 'Name of the move to check',
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
    currentStage = data.species.get(currentStage.prevo);
  }
  return currentStage;
}

async function checkMove(data, pokemon, move) {
  const finalSources = [];
  let latestGen = 0;
  let loopCount = -1;
  for await (const learnset of data.learnsets.all(pokemon)) {
    loopCount++;
    const sources = (learnset.learnset[move.id] ?? []).filter(el => {
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

  const pokemon = data.species.get(Data.toID(args.name));

  if(!pokemon?.exists) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [
          buildError(`Could not find a Pokémon named ${args.name} in the given generation.`)
        ],
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    };
  }

  const restriction = args.mode === 'vgc' ? vgcNotes[data.num - 1] : undefined;

  if(!args.move) {
    return await listMoves(data, pokemon, restriction);
  }

  const move = data.moves.get(Data.toID(args.move));

  if(!move?.exists) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [
          buildError(`Could not find a move named ${args.move}${args.gen ? ` in Generation ${args.gen}` : ''}.`)
        ],
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    };
  }

  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      embeds: [buildEmbed({
        title: pokemon.name,
        fields: [await checkMove(data, pokemon, move)],
        color: colours.types[Data.toID(pokemon.types[0])],
      })],
    },
  };

};

function autocomplete(interaction) {
  const {params, focused} = getargs(interaction);
  return {
    type: InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
    data: {
      choices: focused === 'name' ? completePokemon(params['name']) : completeMove(params['move']),
    },
  };
}

module.exports = {
  definition,
  command: {
    process,
    autocomplete,
  }
};

