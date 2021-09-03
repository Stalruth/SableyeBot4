'use strict';

const Dex = require('@pkmn/dex');
const Data = require('@pkmn/data');

const getarg = require('discord-getarg');

const natures = new Data.Generations(Dex.Dex).get(8).natures;

const listNatures = (natureList) => {
  const result = [];
  for(const nature of natureList) {
    result.push({
      name: nature.name,
      value: nature.id
    });
  }
  return result;
}

const command = {
  description: 'Returns the stats affected by the Nature provided.',
  options: [
    {
      name: 'name',
      type: 3,
      description: 'Name of the Nature.',
      required: true,
      choices: listNatures(natures)
    },
  ],
}

const process = (req, res) => {
  const param = getarg(req.body, 'name').value;

  const nature = natures.get(param);
  if(nature.plus === nature.minus) {
    res.json({
      type: 4,
      data: {
        content: `${nature['name']}: No effect.`,
      },
    });
  } else {
    res.json({
      type: 4,
      data: {
        content: `${nature['name']}: +${nature['plus'].toUpperCase()} -${nature['minus'].toUpperCase()}`,
      },
    });
  }
}

module.exports = {command, process}

