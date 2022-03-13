'use strict';

const { InteractionResponseFlags, InteractionResponseType } = require('discord-interactions');
const Data = require('@pkmn/data');
const Img = require('@pkmn/img');
const Sim = require('@pkmn/sim');

const getargs = require('discord-getarg');
const { buildError } = require('embed-builder');
const { completeSprite, getAutocompleteHandler } = require('pokemon-complete');

const definition = {
  description: 'Shows the Pokémon Showdown sprite requested.',
  options: [
    {
      name: 'pokemon',
      type: 3,
      description: 'Pokemon to show.',
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
      description: 'Show the back facing variant.',
    },
    {
      name: 'female',
      type: 5,
      description: 'Show the female variant.',
    },
    {
      name: 'april-fools',
      type: 5,
      description: 'Use the April Fools Day sprites.',
    },
    {
      name: 'gen',
      type: 3,
      description: 'The Generation to look up.',
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
      ]
    },
  ]
};

const process = function(interaction) {
  const args = getargs(interaction).params;

  const gen = args['april-fools'] ? 'gen5' : (args.gen ?? 'ani');

  const pokemon = Sim.Dex.species.get(Data.toID(args.pokemon));

  if(!pokemon?.exists || ['Custom','CAP'].includes([pokemon.isNonstandard])) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [buildError(`Could not find a Pokemon named ${args.pokemon}.`)],
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    };
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
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [buildError(`Could not find a Pokemon named ${args.pokemon}.`)],
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    };
  }

  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: args['april-fools'] ? spriteUrl.replace('gen5', 'afd') : spriteUrl,
    },
  };
};

const autocomplete = {
  pokemon: getAutocompleteHandler(completeSprite, 'pokemon'),
};

module.exports = {
  definition,
  command: {
    process,
    autocomplete,
  }
};

