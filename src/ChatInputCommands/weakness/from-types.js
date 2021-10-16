'use strict';

const Data = require('@pkmn/data');
const Dex = require('@pkmn/dex');

const dataSearch = require('datasearch');
const getargs = require('discord-getarg');
const buildEmbed = require('embed-builder');
const colours = require('pkmn-colours');
const { completeType } = require('pkmn-complete');
const damageTaken = require('typecheck');

const command = {
  description: 'Returns the resistances and weaknesses of a Pokémon with the given types.',
  options: [
    {
      name: 'types',
      type: 3,
      description: 'Comma separated list of types to check the combined coverage of.',
      required: true,
      autocomplete: true,
    },
    {
      name: 'gen',
      type: 4,
      description: 'The Generation used in calculation',
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
}

const process = (req, res) => {
  const args = getargs(req.body).params;
  args.gen ??= 8;

  const data = new Data.Generations(Dex.Dex).get(args.gen);

  const types = [...new Set(args.types
      .split(',')
      .slice(0,3)
      .map((el) => {
        return dataSearch(data.types, Data.toID(el))?.result?.name;
      }))]

  if(types.some((el) => {return !el;})) {
    let nonTypes = [];
    for(const i in types) {
      if(!types[i]) {
        nonTypes.push(args.types.split(',')[i]);
      }
    }

    res.json({
      type: 4,
      data: {
        embeds: [buildEmbed({
          title: "Error",
          description: `Could not find Type(s) named ${nonTypes.join(',')} in Generation ${args.gen}.`,
          color: 0xCC0000,
        })],
        flags: 1 << 6,
      },
    });
    return;
  }

  let title = `- [${types.join('/')}]`;
  let description = '';

  const eff = {
    '0x': [],
    '0.125x': [],
    '0.25x': [],
    '0.5x': [],
    '1x': [],
    '2x': [],
    '4x': [],
    '8x': [],
  };

  for(const i of data.types) {
    eff[`${damageTaken(data, types, i.id)}x`].push(i.name);
  }

  for(const i of ['0x', '0.125x', '0.25x', '0.5x', '1x', '2x', '4x', '8x']) {
    if(eff[i].length === 0) { continue; }
    description += `\n${i}: ${eff[i].join(', ')}`;
  }

  res.json({
    type: 4,
    data: {
      embeds: [buildEmbed({
        title,
        description,
        color: colours.types[Data.toID(types[0])]
      })]
    },
  });
}

function autocomplete(req, res) {
  const args = getargs(req.body).params;

  const types = args.types.split(',')
      .slice(0,3)
      .map(Data.toID);
  const current = types.pop();
  const resolved = types.map(e=>dataSearch(Dex.Dex.types, e)?.result);

  if(resolved.some(e=>!e)) {
    res.json({
      type: 8,
      data: {
        choices: [],
      },
    });
    return;
  }

  const prefix = resolved.reduce((acc,cur) => {
    return {
      name: `${acc.name}${cur.name}, `,
      value: `${acc.value}${cur.id},`,
    };
  }, {name:'',value:''});

  res.json({
    type: 8,
    data: {
      choices: completeType(current)
        .filter(e=>!resolved.some(r=>e.value===r.id))
        .map(e=>{
          return {
            name: `${prefix.name}${e.name}`,
            value: `${prefix.value}${e.value}`,
          };
        }),
    },
  });
}

module.exports = {command, process, autocomplete};

