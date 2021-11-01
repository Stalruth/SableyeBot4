'use strict';

const { InteractionResponseFlags, InteractionResponseType } = require('discord-interactions');
const Data = require('@pkmn/data');
const Dex = require('@pkmn/dex');

const getargs = require('discord-getarg');
const buildEmbed = require('embed-builder');
const natDexData = require('natdexdata');
const { completeAbility } = require('pkmn-complete');

const command = {
  description: 'Return information on the given ability.',
  options: [
    {
      name: 'name',
      type: 3,
      description: 'Name of the Ability',
      required: true,
      autocomplete: true,
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

const process = function(interaction) {
  const args = getargs(interaction).params;
  const data = args.gen ? new Data.Generations(Dex.Dex).get(args.gen) : natDexData;

  const ability = data.abilities.get(Data.toID(args.name));

  if(!ability?.exists) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [buildEmbed({
          title: "Error",
          description: `Could not find an ability named ${args.name}${args.gen ? ` in Generation ${args.gen}` : ''}.`,
          color: 0xCC0000,
        })],
        flags: InteractionResponseFlags.EPHEMERAL,
      }
    };
  }

  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      embeds: [buildEmbed({
        title: ability['name'],
        description: ability['desc'],
      })],
    }
  };
};

function autocomplete(interaction) {
  const args = getargs(interaction).params;
  return {
    type: InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
    data: {
      choices: completeAbility(Data.toID(args['name'])),
    },
  };
}

module.exports = {command, process, autocomplete};

