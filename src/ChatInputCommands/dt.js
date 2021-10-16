'use strict';

const Data = require('@pkmn/data');
const Dex = require('@pkmn/dex');

const dataSearch = require('datasearch');
const getargs = require('discord-getarg');
const buildEmbed = require('embed-builder');
const natDexData = require('natdexdata');
const { completeAll } = require('pkmn-complete');

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
      autocomplete: true,
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
  const args = getargs(req.body).params;

  const data = args.gen ? new Data.Generations(Dex.Dex).get(args.gen) : natDexData;

  const distance = {
    ability: dataSearch(data.abilities, Data.toID(args.name)),
    item: dataSearch(data.items, Data.toID(args.name)),
    move: dataSearch(data.moves, Data.toID(args.name)),
    nature: dataSearch(data.natures, Data.toID(args.name)),
    pokemon: dataSearch(data.species, Data.toID(args.name)),
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
        embeds: [buildEmbed({
          title: "Error",
          description: `Could not find a result matching ${args.name} in Generation ${args.gen ?? Dex.Dex.gen}`,
          color: 0xCC0000,
        })],
        flags: 1 << 6,
      },
    });
    return;
  }

  dt[mostAccurate](req, res);
};

function autocomplete(req, res) {
  const args = getargs(req.body).params;
  res.json({
    type: 8,
    data: {
      choices: completeAll(args['name']),
    },
  });
}

module.exports = {command, process, autocomplete};

