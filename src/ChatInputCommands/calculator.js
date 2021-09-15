'use strict';

const command = {
  description: 'Link to the Pokemon Showdown Damage Calculator.',
};

const process = function(req, res) {
  res.json({
    type: 4,
    data: {
      content: 'Pokemon damage calculator: https://pokemonshowdown.com/damagecalc/',
    }
  });
};

module.exports = {command, process};

