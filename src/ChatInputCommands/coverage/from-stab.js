'use strict';

const Dex = require('@pkmn/dex');
const Data = require('@pkmn/data');

const dataSearch = require('datasearch');
const { getargs } = require('discord-getarg');
const { damageTaken } = require('typecheck');


const command = {
  description: 'Returns the offensive coverage of a Pokémon\'s moves.',
  options: [
    {
      name: 'pokemon',
      type: 3,
      description: 'Pokemon to evaluate the STABs of',
      required: true,
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
  args.gen ??= Dex.Dex.gen;

  const data = new Data.Generations(Dex.Dex).get(args.gen);

  const pokemon = dataSearch(data.species, Data.toID(args.pokemon))?.result;

  if(!pokemon) {
    res.json({
      type: 4,
      data: {
        embeds: [{
          title: "Error",
          description: `Could not find a Pokémon named ${args.pokemon} in Generation ${args.gen}.`,
          color: 0xCC0000,
          footer: {
            text: `SableyeBot version 4.0.0-alpha`,
            icon_url: 'https://cdn.discordapp.com/avatars/211522070620667905/6b037c17fc6671f0a5dc73803a4c3338.webp',
          },
        }],
        flags: 1 << 6,
      },
    });
    return;
  }

  const title = `${pokemon['name']} [${pokemon['types'].join('/')}]`;
  let description = '';

  const eff = {
    '0': [],
    '0.5': [],
    '1': [],
    '2': [],
  };

  for(const dType of data.types) {
    const mult = pokemon.types.reduce((acc, aType) => {
      return Math.max(acc, damageTaken(data, [dType.id], aType));
    }, 0);
    eff[`${mult}`].push(dType.name);
  }

  for(const i of ['0', '0.5', '1', '2']) {
    if(eff[i].length === 0) { continue; }
    description += `\n${i}x: ${eff[i].join(', ')}`;
  }

  res.json({
    type: 4,
    data: {
      embeds: [{
        title,
        description,
        color: 0x5F32AB,
        footer: {
          text: `SableyeBot version 4.0.0-alpha`,
          icon_url: 'https://cdn.discordapp.com/avatars/211522070620667905/6b037c17fc6671f0a5dc73803a4c3338.webp',
        },
      }],
    },
  });
}

module.exports = {command, process}

