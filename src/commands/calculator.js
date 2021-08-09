'use strict';

const command = {
  description: 'Link to the Pokemon Showdown Damage Calculator.',
};

const process = async function(client, interaction) {
  await interaction.editReply('Pokemon damage calculator: https://pokemonshowdown.com/damagecalc/');
};

module.exports = {command, process};

