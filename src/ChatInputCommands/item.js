'use strict';

const Data = require('@pkmn/data');
const Dex = require('@pkmn/dex');

const dataSearch = require('datasearch');
const getargs = require('discord-getarg');
const buildEmbed = require('embed-builder');
const natDexData = require('natdexdata');
const { completeItem } = require('pkmn-complete');

const command = {
  description: 'Return information on the given item.',
  options: [
    {
      name: 'name',
      type: 3,
      description: 'Name of the Item',
      required: true,
      autocomplete: true,
    },
    {
      name: 'verbose',
      type: 5,
      description: 'Show more information such as Natural Gift and Fling information.',
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

  const data = args.gen ? new Data.Generations(Dex.Dex).get(args.gen) : natDexData;

  const item = dataSearch(data.items, Data.toID(args.name))?.result;

  if(!item) {
    res.json({
      type: 4,
      data: {embeds: [buildEmbed({
          title: "Error",
          description: `Could not find an item named ${args.name} in Generation ${args.gen ?? Dex.Dex.gen}.`,
          color: 0xCC0000,
        })],
        flags: 1<< 6,
      },
    });
    return;
  }

  let title = item['name'];
  let description = item['desc'];

  if(args.verbose) {
    if(item['naturalGift']) {
      description += `\nNatural Gift: ${item['naturalGift']['basePower']} Power ${item['naturalGift']['type']}-type.`;
    }
    if(item['fling']) {
      description += `\nFling: ${item['fling']['basePower']} Power`;
      if(item['fling']['status'] || item['fling']['volatileStatus']) {
        description += `, causes ${item['fling']['status'] || item['fling']['volatileStatus']}`;
      }
    }

    description += `\nIntroduced: Generation ${item['gen']}`;
  }

  res.json({
    type: 4,
    data: {
      embeds: [buildEmbed({
        title,
        description,
      })],
    },
  });
};

function autocomplete(req, res) {
  const args = getargs(req.body).params;
  res.json({
    type: 8,
    data: {
      choices: completeItem(args['name']),
    },
  });
}

module.exports = {command, process, autocomplete};

