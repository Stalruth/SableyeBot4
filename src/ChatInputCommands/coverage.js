'use strict';

const { InteractionResponseFlags, InteractionResponseType } = require('discord-interactions');
const Data = require('@pkmn/data');

const getargs = require('discord-getarg');
const buildEmbed = require('embed-builder');
const gens = require('gen-db');
const colours = require('pkmn-colours');
const { completePokemon, completeType } = require('pkmn-complete');
const damageTaken = require('typecheck');

const command = {
  description: 'Returns type coverage based on a Pokémons STAB and/or types.',
  options: [
    {
      name: 'pokemon',
      type: 3,
      description: 'Pokémon to evaluate the STABs of',
      required: false,
      autocomplete: true,
    },
    {
      name: 'types',
      type: 3,
      description: 'Types to evaluate the STABs of',
      required: false,
      autocomplete: true,
    },
    {
      name: 'gen',
      type: 3,
      description: 'The Generation used in calculation',
      choices: gens.names,
    },
  ],
};

const process = (interaction) => {
  const args = getargs(interaction).params;

  const data = gens.data[args.gen ? args.gen : 'gen8natdex'];

  if(!args.pokemon && !args.types) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [buildEmbed({
          title: 'Error',
          description: 'Please provide a Pokémon and/or at least one Type.',
          color: 0xCC0000,
        })],
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    };
  }

  const titleInfo = {
    pokemon: false,
    types: [],
  };

  const types = []

  if(args.pokemon) {
    const pokemon = data.species.get(Data.toID(args.pokemon));

    if(!pokemon?.exists) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: [buildEmbed({
            title: 'Error',
            description: `Pokémon ${args.pokemon} does not exist in the given generation.`,
            color: 0xCC0000,
          })],
          flags: InteractionResponseFlags.EPHEMERAL,
        },
      };
    }

    titleInfo.pokemon = {
      name: pokemon.name,
      types: pokemon.types,
    };

    pokemon.types.forEach((el) => {types.push(el)});
  }

  if(args.types) {
    const sanitisedTypes = args.types
        .split(',')
        .map(el=>data.types.get(Data.toID(el))?.name);

    if(sanitisedTypes.some(el=>!el)) {
      const nonTypes = sanitisedTypes.map((el,a,i) => {
        if(el) { return undefined; }
        return args.types.split(',')[i];
      }).filter(el=>!!el);

      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: [buildEmbed({
            title: 'Error',
            description: `The type(s) ${nonTypes.join(', ')} do not exist in the given generation.`,
            color: 0xCC0000,
          })],
          flags: InteractionResponseFlags.EPHEMERAL,
        },
      };
    }

    titleInfo.types = [...new Set(sanitisedTypes)];
    types.push(...titleInfo.types);
  }

  const title = (titleInfo.pokemon ? `${titleInfo.pokemon.name} [${titleInfo.pokemon.types.join('/')}] ` : '') + `${titleInfo.types.join(', ')}`;

  const eff = {
    '0': [],
    '0.5': [],
    '1': [],
    '2': [],
  };

  for(const dType of data.types) {
    const mult = types.reduce((acc, aType) => {
      return Math.max(acc, damageTaken(data, [dType.id], aType));
    }, 0);
    eff[`${mult}`].push(dType.name);
  }

  let description = '';
  for(const i of ['0', '0.5', '1', '2']) {
    if(eff[i].length === 0) { continue; }
    description += `\n${i}x: ${eff[i].join(', ')}`;
  }

  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      embeds: [buildEmbed({
        title,
        description,
        color: colours.types[Data.toID(types[0])]
      })],
    },
  };

};

function autocomplete(interaction) {
  const {params, focused} = getargs(interaction);

  if(focused === 'pokemon') {
    return {
      type: InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
      data: {
        choices: completePokemon(params['pokemon']),
      },
    };
  }

  if(focused === 'types') {
    let typesGiven = 0;
    if(params.pokemon) {
      const pokemon = gens.data['gen8natdex'].species.get(Data.toID(params.pokemon));
      if(pokemon?.exists) {
        typesGiven = pokemon.types.length;
      }
    }

    const types = params.types.split(',')
      .slice(0,4 - typesGiven)
      .map(Data.toID);
    const current = types.pop();
    const resolved = types.map(e=>gens.data['gen8natdex'].types.get(e));

    if(resolved.some(e=>!e)) {
      res.json({
        type: 8,
        data: {
          choices: [],
        },
      });
      return;
    }

    const prefix = resolved.reduce((acc,cur) => {
      return {
        name: `${acc.name}${cur.name}, `,
        value: `${acc.value}${cur.id},`,
      };
    }, {name:'',value:''});

    return {
      type: InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
      data: {
        choices: completeType(current)
        .filter(e=>!resolved.some(r=>e.value===r.id))
        .map(e=>{
          return {
            name: `${prefix.name}${e.name}`,
            value: `${prefix.value}${e.value}`,
          };
        }),
      },
    };
  }
}

module.exports = {command, process, autocomplete};

