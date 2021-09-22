'use strict';

const Dex = require('@pkmn/dex');
const Data = require('@pkmn/data');

const { getargs } = require('discord-getarg');

const types = new Data.Generations(Dex.Dex).get(7).types;

const listTypes = function(typeList) {
  const result = [];
  for(const type of typeList) {
    result.push({
      name: type['name'],
      value: type['id'],
    });
  }
  return result;
}

const command = {
  description: 'Returns the Hidden Power produced by the given IVs.',
  options: [
    {
      name: 'type',
      type: 3,
      description: 'The Type to look up.',
      required: true,
      choices: listTypes(types),
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
  args.gen ??= 7;

  const types = new Data.Generations(Dex.Dex).get(args.gen).types;
  const type = types.get(args.type);

  if(args.gen === 1 || args.gen === 8) {
    res.json({
      type: 4,
      data: {
        content: `Hidden power does not exist in Generation ${args.gen}.`,
        flags: 1 << 6,
      },
    });
    return;
  }

  if(['normal','fairy'].includes(type['id'])) {
    res.json({
      type: 4,
      data: {
        content: `There is no way to get a ${type['name']}-Type Hidden Power.`,
      },
    });
    return;
  }

  const stats = {...{
    hp: args.gen == 2 ? 15 : 31,
    atk: args.gen == 2 ? 15 : 31,
    def: args.gen == 2 ? 15 : 31,
    spa: args.gen == 2 ? undefined : 31,
    spd: args.gen == 2 ? undefined : 31,
    spc: args.gen == 2 ? 15 : undefined,
    spe: args.gen == 2 ? 15 : 31,
  }, ...(args.gen == 2 ? type.HPdvs : type.HPivs)};

  const result = `Hidden Power ${type['name']} - HP: ${stats['hp']}, Atk: ${stats['atk']}, Def: ${stats['def']}, `
    + (args.gen === 2 ? `Spc: ${stats['spc']},` : `SpA: ${stats['spa']}, SpD: ${stats['spd']},`)
    + ` Spe: ${stats['spe']}`;
  res.json({
    type: 4,
    data: {
      content: result,
    },
  });
}

module.exports = {command, process}

