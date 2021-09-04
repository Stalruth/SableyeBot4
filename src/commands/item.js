'use strict';

const Dex = require('@pkmn/dex');
const Data = require('@pkmn/data');

const dataSearch = require('datasearch');
const getarg = require('discord-getarg');

const command = {
  description: 'Return information on the given item.',
  options: [
    {
      name: 'name',
      type: 3,
      description: 'Name of the Item',
      required: true,
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
  const name = getarg(req.body, 'name').value;
  const gen = getarg(req.body, 'gen')?.value ?? Dex.Dex.gen;
  const verbose = getarg(req.body, 'verbose')?.value ?? false;

  const data = new Data.Generations(Dex.Dex).get(gen);

  const item = dataSearch(data.items, Data.toID(name))?.result;

  if(!item) {
    res.json({
      type: 4,
      data: {
        content: `Could not find an item named ${name} in Generation ${gen}.`,
        flags: 1<< 6,
      },
    });
    return;
  }

  let reply = `${item['name']}\n${item['desc']}`;

  if(verbose) {
    if(item['naturalGift']) {
      reply += `\nNatural Gift: ${item['naturalGift']['basePower']} Power ${item['naturalGift']['type']}-type.`;
    }
    if(item['fling']) {
      reply += `\nFling: ${item['fling']['basePower']} Power`;
      if(item['fling']['status'] || item['fling']['volatileStatus']) {
        reply += `, causes ${item['fling']['status'] || item['fling']['volatileStatus']}`;
      }
    }

    reply += `\nIntroduced: Generation ${item['gen']}`;
  }

  res.json({
    type: 4,
    data: {
      content: reply,
    },
  });
};

module.exports = {command, process};

