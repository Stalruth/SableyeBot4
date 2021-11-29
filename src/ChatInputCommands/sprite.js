'use strict';

const { InteractionResponseFlags, InteractionResponseType } = require('discord-interactions');
const Data = require('@pkmn/data');
const Img = require('@pkmn/img');
const Sim = require('@pkmn/sim');

const getargs = require('discord-getarg');
const buildEmbed = require('embed-builder');
const { completeSprite } = require('pkmn-complete');

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
      name: 'afd',
      type: 5,
      description: 'Use the April Fools Day sprites.',
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
      ]
    },
  ]
};

const process = function(interaction) {
  const args = getargs(interaction).params;
  args.gen ??= 'ani';

  const gen = args.afd ? 'gen5' : args.gen;

  const pokemon = Sim.Dex.species.get(Data.toID(args.pokemon));

  if(!pokemon?.exists || ['Custom','CAP'].includes([pokemon.isNonstandard])) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [buildEmbed({
          title: "Error",
          description: `Could not find a Pokemon named ${args.pokemon}.`,
          color: 0xCC0000,
        })],
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
        embeds: [buildEmbed({
          title: "Error",
          description: `Could not find a Pokemon named ${args.pokemon}.`,
          color: 0xCC0000,
        })],
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    };
  }

  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: args.afd ? spriteUrl.replace('gen5', 'afd') : spriteUrl,
    },
  };
};

function autocomplete(interaction) {
  const args = getargs(interaction).params;
  console.log(completeSprite(args['pokemon']));
  return {
    type: InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
    data: {
      choices: completeSprite(args['pokemon']),
    },
  };
}

module.exports = {command, process, autocomplete};

