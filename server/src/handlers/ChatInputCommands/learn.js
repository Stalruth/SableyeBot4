'use strict';

const { InteractionResponseFlags, InteractionResponseType } = require('discord-interactions');
const Data = require('@pkmn/data');

const getargs = require('discord-getarg');
const { buildEmbed, buildError } = require('embed-builder');
const decodeSource = require('learnsetutils');
const gens = require('gen-db');
const colours = require('pkmn-colours');
const { completePokemon, completeMove } = require('pkmn-complete');

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
    .filter(id => learnsets.map(l => l['learnset'][id])
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

  const learnables = await data.learnsets.learnable(pokemon.id, restriction);

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

  if(!learnables[move.id]) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [buildEmbed({
          description: `${pokemon.name} does not learn ${move.name} in Generation ${data.num}.`,
          color: colours.types[Data.toID(pokemon.types[0])],
        })],
      },
    };
  }

  const latestSourceGen = learnables[move.id][0][0];
  if(Number(latestSourceGen) !== data.num) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [buildEmbed({
          description: `${pokemon.name} learns ${move.name} when transferred from Generation ${latestSourceGen}`,
          color: colours.types[Data.toID(pokemon.types[0])],
        })],
      },
    };
  }

  let currentSpecies = pokemon;
  while(true) {
    const sources = (await data.learnsets.get(currentSpecies.id) ?? await data.learnsets.get(currentSpecies.baseSpecies))['learnset'][move.id] ?? [];
    const filteredSources = sources.filter(el => (el[0].startsWith(`${latestSourceGen}`)) && !((args.mode === 'vgc') && el.endsWith('V')));
    if(filteredSources.length > 0) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: [buildEmbed({
            title: `${pokemon.name} does learn ${move.name}`,
            fields: [
              {
                name: `As ${currentSpecies.name}`,
                value: filteredSources.map(decodeSource)
                  .map(el=>`- ${el}`)
                  .join('\n'),
              },
            ],
            color: colours.types[Data.toID(pokemon.types[0])],
          })],
        },
      };
    }
    currentSpecies = data.species.get(currentSpecies.prevo ?? '');
    if(!currentSpecies) {
      break;
    }
  }

  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      embeds: [buildEmbed({
        description: `${pokemon.name} does not learn ${move.name} in Generation ${data.num}.`,
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

