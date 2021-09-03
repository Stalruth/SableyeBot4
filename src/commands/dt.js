'use strict';

const Dex = require('@pkmn/dex');
const Data = require('@pkmn/data');

const dataSearch = require('datasearch');
const getarg = require('discord-getarg');

const dt = {
  ability: require('./ability.js').process,
  item: require('./item.js').process,
  move: require('./move.js').process,
  nature: require('./nature/from-name.js').process,
  pokemon: require('./pokemon.js').process,
};

const command = {
  description: 'Return information on the given Pokemon, Ability, Move, Item, or Nature.',
  options: [
    {
      name: 'name',
      type: 3,
      description: 'Name of the Pokemon, Ability, Move, Item or Nature to look up.',
      required: true,
    },
    {
      name: 'verbose',
      type: 5,
      description: 'Return extra information.',
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

  const data = new Data.Generations(Dex.Dex).get(gen);

  const distance = {
    ability: dataSearch(data.abilities, Data.toID(name)),
    item: dataSearch(data.items, Data.toID(name)),
    move: dataSearch(data.moves, Data.toID(name)),
    nature: dataSearch(data.natures, Data.toID(name)),
    pokemon: dataSearch(data.species, Data.toID(name)),
  };

  let mostAccurate = null;
  ['pokemon','move','ability','item','nature'].forEach((el) => {
    if(distance[el] === null) {
      return;
    }
    if(mostAccurate === null) {
      mostAccurate = el;
      return;
    }
    if(distance[el].distance < distance[mostAccurate].distance) {
      mostAccurate = el;
      return;
    }
  });

  if(mostAccurate === null) {
    res.json({
      type: 4,
      data: {
        content: `Could not find a result matching ${name} in Generation ${gen}.`,
      },
    });
    return;
  }

  dt[mostAccurate](req, res);
};

module.exports = {command, process};

