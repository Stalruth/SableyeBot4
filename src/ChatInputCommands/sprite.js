'use strict';

const Img = require('@pkmn/img');
const Dex = require('@pkmn/dex');
const Data = require('@pkmn/data');

const dataSearch = require('datasearch');
const { getargs } = require('discord-getarg');

const command = {
  description: 'Link to the Pokemon Showdown Damage Calculator.',
  options: [
    {
      name: 'pokemon',
      type: 3,
      description: 'Pokemon to show',
      required: 'true',
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
      type: 4,
      description: 'The Generation of the sprite.',
      choices: [
        {
          name: 'Yellow',
          value: 1,
        },
        {
          name: 'Crystal',
          value: 2,
        },
        {
          name: 'Emerald',
          value: 3,
        },
        {
          name: 'Platinum',
          value: 4,
        },
        {
          name: 'BW',
          value: 5,
        },
        {
          name: 'X/Y Onwards',
          value: 8,
        },
      ]
    },
  ]
};

const process = function(req, res) {
  const args = getargs(req.body).params;
  args.gen ??= 8;

  const data = new Data.Generations(Dex.Dex).get(args.gen);

  const pokemon = dataSearch(data.species, Data.toID(args.pokemon))?.result;

  if(!pokemon) {
    res.json({
      type: 4,
      data: {
        embeds: [{
          title: "Error",
          description: `Could not find a Pokemon named ${args.pokemon} in Generation ${args.gen}`,
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

  const options = {};
  options['gen'] = args.gen;
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

  res.json({
    type: 4,
    data: {
      content: spriteUrl,
    },
  });
};

module.exports = {command, process};

