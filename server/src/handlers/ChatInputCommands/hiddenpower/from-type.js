'use strict';

const { InteractionResponseFlags, InteractionResponseType } = require('discord-interactions');
const Data = require('@pkmn/data');
const Sim = require('@pkmn/sim');

const getargs = require('discord-getarg');
const buildEmbed = require('embed-builder');
const colours = require('pkmn-colours');

const types = new Data.Generations(Sim.Dex).get(7).types;

const listTypes = function(typeList) {
  const result = [];
  for(const type of typeList) {
    result.push({
      name: type['name'],
      value: type['id'],
    });
  }
  return result;
}

const command = {
  description: 'Returns the "best" IVs that result in a Hidden Power of the given Type.',
  options: [
    {
      name: 'type',
      type: 3,
      description: 'The Type to look up.',
      required: true,
      choices: listTypes(types),
    },
    {
      name: 'gen',
      type: 4,
      description: 'The Generation to calculate for.',
      choices: [
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
      ]
    },
  ],
}

const process = (interaction) => {
  const args = getargs(interaction).params;
  args.gen ??= 7;

  const types = new Data.Generations(Sim.Dex).get(args.gen).types;
  const type = types.get(args.type);

  if(['normal','fairy'].includes(type['id'])) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [buildEmbed({
          title: `Hidden Power ${type['name']}`,
          description: `There is no way to get a ${type['name']}-Type Hidden Power.`,
          color: colours.types[Data.toID(type['name'])],
        })],
      },
    };
  }

  const stats = {...{
    hp: args.gen == 2 ? 15 : 31,
    atk: args.gen == 2 ? 15 : 31,
    def: args.gen == 2 ? 15 : 31,
    spa: args.gen == 2 ? undefined : 31,
    spd: args.gen == 2 ? undefined : 31,
    spc: args.gen == 2 ? 15 : undefined,
    spe: args.gen == 2 ? 15 : 31,
  }, ...(args.gen == 2 ? type.HPdvs : type.HPivs)};

  const title = `Hidden Power ${type['name']}`;
  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      embeds: [buildEmbed({
        title,
        fields: [
          {
            name: 'HP',
            value: stats['hp'],
            inline: true,
          },
          {
            name: 'Attack',
            value: stats['atk'],
            inline: true,
          },
          {
            name: 'Defence',
            value: stats['def'],
            inline: true,
          },
          ...(
            args.gen === 2 ?
            [
              {
                name: 'Special',
                value: stats['spc'],
                inline: true,
              }
            ]
            :
            [
              {
                name: 'Sp. Attack',
                value: stats['spa'],
                inline: true,
              },
              {
                name: 'Sp. Defence',
                value: stats['spd'],
                inline: true,
              }
            ]
          ),
          {
            name: 'Speed',
            value: stats['spe'],
            inline: true,
          },
        ],
        color: colours.types[Data.toID(type['name'])]
      })],
    },
  };
}

module.exports = {command, process}

