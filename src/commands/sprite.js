'use strict';

const Img = require('@pkmn/img');
const Dex = require('@pkmn/dex');
const Data = require('@pkmn/data');
const dataSearch = require('datasearch');

const command = {
  description: 'Link to the Pokemon Showdown Damage Calculator.',
  options: [
    {
      name: 'pokemon',
      type: 'STRING',
      description: 'Pokemon to show',
      required: 'true',
    },
    {
      name: 'shiny',
      type: 'BOOLEAN',
      description: 'Show the Shiny variant.',
    },
    {
      name: 'back',
      type: 'BOOLEAN',
      description: 'Show the back variant.',
    },
    {
      name: 'female',
      type: 'BOOLEAN',
      description: 'Show the female variant.',
    },
    {
      name: 'gen',
      type: 'INTEGER',
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

const process = async function(client, interaction) {
  const name = interaction.options.getString('pokemon');
  const gen = interaction.options.getInteger('gen') ?? Dex.Dex.gen;
  const shiny = interaction.options.getBoolean('shiny') ?? false;
  const back = interaction.options.getBoolean('back') ?? false;
  const female = interaction.options.getBoolean('female') ?? false;

  const data = new Data.Generations(Dex.Dex).get(gen);

  const pokemon = dataSearch(data.species, Data.toID(name))?.result;

  if(!pokemon) {
    await interaction.editReply(`Could not find a Pokémon named ${name} in Generation ${gen}.`);
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

  await interaction.editReply(spriteUrl);
};

module.exports = {command, process};

