'use strict';

const Dex = require('@pkmn/dex');
const Data = require('@pkmn/data');

const dataSearch = require('datasearch');
const { getargs } = require('discord-getarg');
const buildEmbed = require('embed-builder');

const command = {
  description: 'Return information on the given ability.',
  options: [
    {
      name: 'name',
      type: 3,
      description: 'Name of the Ability',
      required: true,
    },
    {
      name: 'gen',
      type: 4,
      description: 'The Generation used for lookup.',
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

const process = function(req, res) {
  const args = getargs(req.body).params;

  const data = args.gen ? new Data.Generations(Dex.Dex).get(args.gen) : Dex.Dex;

  const ability = dataSearch(data.abilities, Data.toID(args.name))?.result;

  if(!ability) {
    res.json({
      type: 4,
      data: {
        embeds: [buildEmbed({
          title: "Error",
          description: `Could not find an ability named ${args.name} in Generation ${args.gen ?? Dex.Dex.gen}.`,
          color: 0xCC0000,
        })],
        flags: 1 << 6,
      }
    });
    return;
  }

  res.json({
    type: 4,
    data: {
      embeds: [buildEmbed({
        title: ability['name'],
        description: ability['desc'],
      })],
    }
  });
};

module.exports = {command, process};

