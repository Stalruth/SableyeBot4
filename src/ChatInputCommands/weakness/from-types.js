'use strict';

const { InteractionResponseFlags, InteractionResponseType } = require('discord-interactions');
const Data = require('@pkmn/data');
const Sim = require('@pkmn/sim');

const getargs = require('discord-getarg');
const buildEmbed = require('embed-builder');
const gens = require('gen-db');
const colours = require('pkmn-colours');
const { completeType } = require('pkmn-complete');
const damageTaken = require('typecheck');

const command = {
  description: 'Returns the resistances and weaknesses of a Pokémon with the given types.',
  options: [
    {
      name: 'types',
      type: 3,
      description: 'Comma separated list of types to check the combined coverage of.',
      required: true,
      autocomplete: true,
    },
    {
      name: 'gen',
      type: 3,
      description: 'The Generation used in calculation',
      choices: gens.names,
    },
  ],
}

const process = (interaction) => {
  const args = getargs(interaction).params;
  args.gen ??= 8;

  const data = gens.data[args.gen ? args.gen : 'gen8natdex'];

  const types = [...new Set(args.types
      .split(',')
      .slice(0,3)
      .map((el) => {
        return data.types.get(Data.toID(el))?.name;
      }))]

  if(types.some((el) => {return !el;})) {
    let nonTypes = [];
    for(const i in types) {
      if(!types[i]) {
        nonTypes.push(args.types.split(',')[i]);
      }
    }

    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [buildEmbed({
          title: "Error",
          description: `Could not find Type(s) named ${nonTypes.join(',')} in Generation ${args.gen}.`,
          color: 0xCC0000,
        })],
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    };
  }

  let title = `- [${types.join('/')}]`;
  let description = '';

  const eff = {
    '0x': [],
    '0.125x': [],
    '0.25x': [],
    '0.5x': [],
    '1x': [],
    '2x': [],
    '4x': [],
    '8x': [],
  };

  for(const i of data.types) {
    eff[`${damageTaken(data, types, i.id)}x`].push(i.name);
  }

  for(const i of ['0x', '0.125x', '0.25x', '0.5x', '1x', '2x', '4x', '8x']) {
    if(eff[i].length === 0) { continue; }
    description += `\n${i}: ${eff[i].join(', ')}`;
  }

  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      embeds: [buildEmbed({
        title,
        description,
        color: colours.types[Data.toID(types[0])]
      })]
    },
  };
}

function autocomplete(interaction) {
  const args = getargs(interaction).params;

  const types = args.types.split(',')
      .slice(0,3)
      .map(Data.toID);
  const current = types.pop();
  const resolved = types.map(e=>gens.data['gen8natdex'].types.get(e));

  if(resolved.some(e=>!e)) {
    return {
      type: InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
      data: {
        choices: [],
      },
    };
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

module.exports = {command, process, autocomplete};

