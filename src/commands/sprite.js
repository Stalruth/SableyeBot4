'use strict';

const Img = require('@pkmn/img');
const Dex = require('@pkmn/dex');
const Data = require('@pkmn/data');

const dataSearch = require('datasearch');
const getarg = require('discord-getarg');

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
  const name = getarg(req.body, 'pokemon').value;
  const gen = getarg(req.body, 'gen')?.value ?? Dex.Dex.gen;
  const shiny = getarg(req.body, 'shiny')?.value ?? false;
  const back = getarg(req.body, 'back')?.value ?? false;
  const female = getarg(req.body, 'female')?.value ?? false;

  const data = new Data.Generations(Dex.Dex).get(gen);

  const pokemon = dataSearch(data.species, Data.toID(name))?.result;

  if(!pokemon) {
    res.json({
      type: 4,
      data: {
        content: `Could not find a Pokémon named ${name} in Generation ${gen}.`,
        flags: 1 << 6,
      },
    });
    return;
  }

  const options = {};
  options['gen'] = gen;
  if(shiny) {
    options['shiny'] = true;
  }
  if(back) {
    options['side'] = 'p1';
  }
  if(female) {
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

