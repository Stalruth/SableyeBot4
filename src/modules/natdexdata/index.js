'use strict';
const Data = require('@pkmn/data');
const Sim = require('@pkmn/sim');

const existedEver = (d) => {
  if (!d.exists) return false;
  if ('isNonstandard' in d && ![null, 'Past'].includes(d.isNonstandard)) return false;
  if (d.kind === 'Ability' && d.id === 'noability') return false;
  return !('tier' in d && d.tier === 'Unreleased');
};

const natDexData = new Data.Generations(Sim.Dex, existedEver).get(8);
natDexData.national = true;

module.exports = natDexData;

