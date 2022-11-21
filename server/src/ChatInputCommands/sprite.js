import { InteractionResponseFlags, InteractionResponseType } from 'discord-interactions';
import Data from '@pkmn/data';
import { Sprites } from '@pkmn/img';
import Sim from '@pkmn/sim';

import getargs from '#utils/discord-getarg';
import { buildError } from '#utils/embed-builder';
import { completeSprite, getAutocompleteHandler } from '#utils/pokemon-complete';

const definition = {
  description: 'Show the sprite for the given Pokémon on Pokémon Showdown.',
  options: [
    {
      name: 'pokemon',
      type: 3,
      description: 'Pokémon to show.',
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
          value: 'gen5ani',
        },
        {
          name: 'X/Y Onwards',
          value: 'ani',
        },
      ]
    },
  ]
};

async function process(interaction, respond) {
  const args = getargs(interaction).params;

  const gen = args['april-fools'] ? 'gen5' : (args.gen ?? 'ani');

  const pokemon = Sim.Dex.species.get(Data.toID(args.pokemon));

  if(!pokemon?.exists || ['Custom','CAP'].includes(pokemon.isNonstandard)) {
    return await respond({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [buildError(`Could not find a Pokemon named ${args.pokemon}.`)],
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    });
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
  const spriteUrl = Sprites.getPokemon(pokemon['id'], options).url;

  if(spriteUrl.endsWith('0.png')) {
    return await respond({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [buildError(`Could not find a Pokemon named ${args.pokemon}.`)],
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    });
  }

  return await respond({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: args['april-fools'] ? spriteUrl.replace('gen5', 'afd') : spriteUrl,
    },
  });
};

const autocomplete = {
  pokemon: getAutocompleteHandler(completeSprite, 'pokemon'),
};

export default {
  definition,
  command: {
    process,
    autocomplete,
  }
};

