'use strict';

const Img = require('@pkmn/img');
const Dex = require('@pkmn/dex');
const Data = require('@pkmn/data');

const dataSearch = require('datasearch');
const { getargs } = require('discord-getarg');
const buildEmbed = require('embed-builder');
const { completePokemon } = require('pkmn-complete');

const command = {
  description: 'Link to the Pokemon Showdown Damage Calculator.',
  options: [
    {
      name: 'pokemon',
      type: 3,
      description: 'Pokemon to show',
      required: true,
      autocomplete: true
    },
    {
      name: 'shiny',
      type: 5,
      description: 'Show the Shiny variant.',
    },
    {
      name: 'back',
      type: 5,
      description: 'Show the back variant.',
    },
    {
      name: 'female',
      type: 5,
      description: 'Show the female variant.',
    },
    {
      name: 'gen',
      type: 3,
      description: 'The Generation of the sprite.',
      choices: [
        {
          name: 'Yellow',
          value: 'gen1',
        },
        {
          name: 'Crystal',
          value: 'gen2',
        },
        {
          name: 'Emerald',
          value: 'gen3',
        },
        {
          name: 'Platinum',
          value: 'gen4',
        },
        {
          name: 'BW',
          value: 'gen5',
        },
        {
          name: 'X/Y Onwards',
          value: 'ani',
        },
        {
          name: 'April Fools',
          value: 'afd',
        },
      ]
    },
  ]
};

const process = function(req, res) {
  const args = getargs(req.body).params;
  args.gen ??= 'ani';
  
  const gen = args.gen === 'afd' ? 'gen5' : args.gen;

  const pokemon = dataSearch(Dex.Dex.species, Data.toID(args.pokemon))?.result;

  if(!pokemon) {
    res.json({
      type: 4,
      data: {
        embeds: [buildEmbed({
          title: "Error",
          description: `Could not find a Pokemon named ${args.pokemon}.`,
          color: 0xCC0000,
        })],
        flags: 1 << 6,
      },
    });
    return;
  }

  const options = {};
  options['gen'] = gen;
  if(args.shiny) {
    options['shiny'] = true;
  }
  if(args.back) {
    options['side'] = 'p1';
  }
  if(args.female) {
    options['gender'] = 'F';
  }
  const spriteUrl = Img.Sprites.getPokemon(pokemon['id'], options).url;
  
  if(spriteUrl.endsWith('0.png')) {
    res.json({
      type: 4,
      data: {
        embeds: [buildEmbed({
          title: "Error",
          description: `Could not find a Pokemon named ${args.pokemon} in Generation ${args.gen}.`,
          color: 0xCC0000,
        })],
        flags: 1 << 6,
      },
    });
    return;
  }

  res.json({
    type: 4,
    data: {
      content: args.gen === 'afd' ? spriteUrl.replace('gen5', 'afd') : spriteUrl,
    },
  });
};

function autocomplete(req, res) {
  const args = getargs(req.body).params;
  res.json({
    type: 8,
    data: {
      choices: completePokemon(args['pokemon']),
    },
  });
}

module.exports = {command, process, autocomplete};

