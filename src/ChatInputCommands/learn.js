'use strict';

const Dex = require('@pkmn/dex');
const Data = require('@pkmn/data');

const { natDexData } = require('natdexdata');
const dataSearch = require('datasearch');
const { getargs } = require('discord-getarg');
const buildEmbed = require('embed-builder');
const colours = require('pkmn-colours');
const { completePokemon, completeMove } = require('pkmn-complete');

const {getChainLearnset, moveAvailable, getMoves, decodeLearnString} = require('learnsetutils');

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

const process = async function(req, res) {
  const args = getargs(req.body).params;

  const genCheck = moveAvailable(args.gen, args.mode === 'vgc');

  const data = args.gen ? new Data.Generations(Dex.Dex).get(args.gen) : natDexData;

  const pokemon = dataSearch(data.species, Data.toID(args.name))?.result;

  if(!pokemon) {
    res.json({
      type: 4,
      data: {
        embeds: [buildEmbed({
          title: "Error",
          description: `Could not find a Pokémon named ${args.name} in Generation ${args.gen ?? Dex.Dex.gen}.`,
          color: 0xCC0000,
        })],
        flags: 1 << 6,
      },
    });
    return;
  }

  const learnsetChain = await getChainLearnset(data, pokemon);

  let title = '';
  let description = '';

  if(!args.move) {
    title = `${pokemon['name']}'s moveset:\n`;
    const moveset = new Set();
    getMoves(data, learnsetChain, genCheck).forEach((el)=>{moveset.add(el)});
    description += [...moveset].sort().join(', ');
  } else {
    const move = dataSearch(data.moves, Data.toID(args.move))?.result;

    if(!move) {
      res.json({
        type: 4,
        data: {
          embeds: [buildEmbed({
            title: "Error",
            description: `Could not find a move named ${args.move} in Generation ${args.gen ?? Dex.Dex.gen}`,
            color: 0xCC0000,
          })],
          flags: 1 << 6,
        },
      });
      return;
    }

    const results = [];
    learnsetChain.forEach((learnset) => {
      const result = {
        name: learnset['name'],
      };
      result['methods'] = (learnset['learnset'][move.id] ?? []).filter(genCheck);
      results.push(result);
    });

    if(results.reduce((acc, cur) => {
      return acc + cur.methods.length;
    }, 0) === 0) {
      description = `${pokemon['name']} does not learn ${move['name']} in Generation ${args.gen ?? Dex.Dex.gen}.`
    } else {
      const isCurrentGen = (el) => {return el[0] == args.gen};
      const currentGenResults = results.map((stage) => {
        return {
          name: stage['name'],
          methods: stage.methods.filter(isCurrentGen),
        };
      });

      description = `${pokemon['name']} can learn ${move['name']} in`;

      if(currentGenResults.reduce((acc, stage)=>acc + stage.methods.length, 0) === 0) {
        description += ` another generation.`;
      } else {
        description += `:\nGen ${args.gen}:`;
        currentGenResults.forEach((stage) => {
          if(stage.methods.length !== 0) {
            description += `\n- ${stage['name']}: ${stage.methods.map(decodeLearnString).join(', ')}`;
          }
        });
      }
    }
  }

  res.json({
    type: 4,
    data: {
      embeds: [buildEmbed({
        title,
        description,
        color: colours.types[Data.toID(pokemon.types[0])]
      })],
    },
  });
};

function autocomplete(req, res) {
  const {params, focused} = getargs(req.body);
  res.json({
    type: 8,
    data: {
      choices: focused === 'name' ? completePokemon(params['name']) : completeMove(params['move']),
    },
  });
}

module.exports = {command, process, autocomplete};

