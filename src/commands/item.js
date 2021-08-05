'use strict';

const Dex = require('@pkmn/dex');
const Data = require('@pkmn/data');

const dataSearch = require('datasearch');

const command = {
  description: 'Return information on the given item.',
  options: [
    {
      name: 'name',
      type: 'STRING',
      description: 'Name of the Item',
      required: true,
    },
    {
      name: 'verbose',
      type: 'BOOLEAN',
      description: 'Show more information such as target and generation.',
    },
    {
      name: 'gen',
      type: 'INTEGER',
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
};

const process = async function(client, interaction) {
  await interaction.defer();

  const name = interaction.options.getString('name');
  const gen = interaction.options.getInteger('gen') ?? Dex.Dex.gen;
  const verbose = interaction.options.getBoolean('verbose') ?? false;

  const data = new Data.Generations(Dex.Dex).get(gen);

  const item = dataSearch(data.items, Data.toID(name))?.result;

  if(item === null) {
    await interaction.editReply(`Could not find an item named ${name} in Generation ${gen}.`);
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

  await interaction.editReply(reply);
};

module.exports = {command, process};

