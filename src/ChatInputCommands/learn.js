'use strict';

const Dex = require('@pkmn/dex');
const Data = require('@pkmn/data');

const dataSearch = require('datasearch');
const { getargs } = require('discord-getarg');

const {getChainLearnset, moveAvailable, getMoves, decodeLearnString} = require('learnsetutils');

const command = {
  description: 'Return the number of events a Pokemon has or the details of a specific event.',
  options: [
    {
      name: 'name',
      type: 3,
      description: 'Name of the Pokémon',
      required: true,
    },
    {
      name: 'move',
      type: 3,
      description: 'Name of the move to check',
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
  args.gen ??= Dex.Dex.gen;

  const genCheck = moveAvailable(args.gen, args.mode === 'vgc');

  const data = new Data.Generations(Dex.Dex).get(args.gen);

  const pokemon = dataSearch(data.species, Data.toID(args.name))?.result;

  if(!pokemon) {
    res.json({
      type: 4,
      data: {
        content: `Could not find a Pokémon named ${args.name} in Generation ${args.gen}.`,
        flags: 1 << 6,
      },
    });
    return;
  }

  const learnsetChain = await getChainLearnset(data, pokemon);

  if(!args.move) {
    let reply = `${pokemon['name']}'s moveset:\n`;
    const moveset = new Set();
    getMoves(data, learnsetChain, genCheck).forEach((el)=>{moveset.add(el)});
    reply += [...moveset].sort().join(', ');
    res.json({
      type: 4,
      data: {
        content: reply,
      },
    });
    return;
  } else {
    const move = dataSearch(data.moves, Data.toID(args.move))?.result;

    if(!move) {
      res.json({
        type: 4,
        data: {
          content: `Could not find a move named ${args.move} in Generation ${args.gen}`,
        },
      });
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
      res.json({
        type: 4,
        data: {
          content: `${pokemon['name']} does not learn ${move['name']} in Generation ${gen}.`,
        },
      });
      return;
    }

    const isCurrentGen = (el) => {return el[0] == args.gen};
    const currentGenResults = results.map((stage) => {
      return {
        name: stage['name'],
        methods: stage.methods.filter(isCurrentGen),
      };
    });

    let reply = `${pokemon['name']} can learn ${move['name']} in`;

    if(currentGenResults.reduce((acc, stage)=>acc + stage.methods.length, 0) === 0) {
      reply += ` another generation.`;
    } else {
      reply += `:\nGen ${args.gen}:`;
      currentGenResults.forEach((stage) => {
        if(stage.methods.length !== 0) {
          reply += `\n- ${stage['name']}: ${stage.methods.map(decodeLearnString).join(', ')}`;
        }
      });
    }

    res.json({
      type: 4,
      data: {
        content: reply,
      },
    });
  }
};

module.exports = {command, process};

