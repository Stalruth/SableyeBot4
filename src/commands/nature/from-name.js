'use strict';

const Dex = require('@pkmn/dex');
const Data = require('@pkmn/data');

const natures = new Data.Generations(Dex.Dex).get(8).natures;

const listNatures = (natureList) => {
  const result = [];
  for(const nature of natureList) {
    result.push({
      name: nature.name,
      value: nature.id
    });
  }
  return result;
}

const command = {
  description: 'Returns the stats affected by the Nature provided.',
  options: [
    {
      name: 'name',
      type: 'STRING',
      description: 'Name of the Nature.',
      required: true,
      choices: listNatures(natures)
    },
  ],
}

const process = async (client, interaction) => {
  const param = interaction.options.getString('name');

  const nature = natures.get(param);
  if(nature.plus === nature.minus) {
    await interaction.reply(`${nature['name']}: No effect.`);
  } else {
    await interaction.reply(`${nature['name']}: +${nature['plus'].toUpperCase()} -${nature['minus'].toUpperCase()}`);
  }
}

module.exports = {command, process}

