'use strict';

const Data = require('@pkmn/data');
const Dex = require('@pkmn/dex');

const dataSearch = require('datasearch');
const getargs = require('discord-getarg');
const buildEmbed = require('embed-builder');
const decodeSource = require('learnsetutils');
const natDexData = require('natdexdata');
const colours = require('pkmn-colours');
const { completePokemon, completeMove } = require('pkmn-complete');

const command = {
  description: 'Return the number of events a Pokemon has or the details of a specific event.',
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
      type: 4,
      description: 'The Generation to check against.',
      choices: [
        {
          name: 'RBY',
          value: 1,
        },
        {
          name: 'GSC',
          value: 2,
        },
        {
          name: 'RSE',
          value: 3,
        },
        {
          name: 'DPPt/HGSS',
          value: 4,
        },
        {
          name: 'BW/BW2',
          value: 5,
        },
        {
          name: 'XY/ORAS',
          value: 6,
        },
        {
          name: 'SM/USM',
          value: 7,
        },
        {
          name: 'SwSh',
          value: 8,
        },
      ]
    },
  ],
};

const process = async function(interaction) {
  const args = getargs(interaction).params;

  const vgcNotes = [,,,,,'Pentagon','Plus','Galar'];

  const data = args.gen ? new Data.Generations(Dex.Dex).get(args.gen) : natDexData;

  const pokemon = dataSearch(data.species, Data.toID(args.name))?.result;

  if(!pokemon) {
    return {
      type: 4,
      data: {
        embeds: [buildEmbed({
          title: "Error",
          description: `Could not find a Pokémon named ${args.name} in Generation ${args.gen ?? Dex.Dex.gen}.`,
          color: 0xCC0000,
        })],
        flags: 1 << 6,
      },
    };
  }

  const learnables = await data.learnsets.learnable(pokemon.id, args.mode === 'vgc' ? vgcNotes[data.num - 1] : undefined);

  let title = '';
  let description = '';

  if(!args.move) {
    return {
      type: 4,
      data: {
        embeds: [buildEmbed({
          title: `${pokemon['name']}'s moveset:\n`,
          description: (Object.keys(learnables)
            .map(id=>data.moves.get(id)?.name)
            .filter(el=>!!el)
            .sort()
            .join(', ')),
          color: colours.types[Data.toID(pokemon.types[0])]
        })],
      },
    };
  }

  const move = dataSearch(data.moves, Data.toID(args.move))?.result;

  if(!move) {
    return {
      type: 4,
      data: {
        embeds: [buildEmbed({
          title: "Error",
          description: `Could not find a move named ${args.move} in Generation ${args.gen ?? Dex.Dex.gen}`,
          color: 0xCC0000,
        })],
        flags: 1 << 6,
      },
    };
  }

  if(!learnables[move.id]) {
    return {
      type: 4,
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
      type: 4,
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
    const sources = (await data.learnsets.get(currentSpecies.id) ?? await data.learnsets.get(currentSpecies.baseSpecies))['learnset'][move.id];
    if(sources?.[0]?.[0] === latestSourceGen) {
      const latestSources = sources.filter(el=>el[0]===latestSourceGen);
      return {
        type: 4,
        data: {
          embeds: [buildEmbed({
            title: `${pokemon.name} does learn ${move.name}`,
            description: `As ${currentSpecies.name}:\n` +
                latestSources.map(decodeSource)
                .map(el=>`- ${el}`)
                .join('\n'),
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
    type: 4,
    data: {
      embeds: [buildEmbed({
        title: "Something went wrong!",
        description: "Please let the developer know what command you ran to cause this message [here](https://github.com/Stalruth/SableyeBot4/issues/new)",
        color: 0xCC0000,
      })],
      flags: 1 << 6,
    },
  };
};

function autocomplete(interaction) {
  const {params, focused} = getargs(interaction);
  return {
    type: 8,
    data: {
      choices: focused === 'name' ? completePokemon(params['name']) : completeMove(params['move']),
    },
  };
}

module.exports = {command, process, autocomplete};

