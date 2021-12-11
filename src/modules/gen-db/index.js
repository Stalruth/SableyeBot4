'use strict';
const Data = require('@pkmn/data');
const Sim = require('@pkmn/sim');
const Mods = require('@pkmn/mods');
const ModBdsp = require('@pkmn/mods/gen8bdsp');

const existedEver = (d) => {
  if (!d.exists) return false;
  if ('isNonstandard' in d && ![null, 'Past'].includes(d.isNonstandard)) return false;
  if (d.kind === 'Ability' && d.id === 'noability') return false;
  return !('tier' in d && d.tier === 'Unreleased');
};


const genNames = [
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
    name: 'HeartGold/SoulSilver',
    value: 'gen4',
  },
  {
    name: 'Black/White 2',
    value: 'gen5',
  },
  {
    name: 'Omega Ruby/Alpha Sapphire',
    value: 'gen6',
  },
  {
    name: 'Ultra Sun/Moon',
    value: 'gen7',
  },
  {
    name: 'Crown Tundra',
    value: 'gen8',
  },
  {
    name: 'Brilliant Diamond/Shining Pearl',
    value: 'gen8bdsp',
  },
  {
    name: 'Gen 8 National Dex',
    value: 'gen8natdex',
  },
];

const natDex = new Data.Generations(Sim.Dex, existedEver).get(8);
natDex.national = true;

const genData = {
  'gen1': new Data.Generations(Sim.Dex).get(1),
  'gen2': new Data.Generations(Sim.Dex).get(2),
  'gen3': new Data.Generations(Sim.Dex).get(3),
  'gen4': new Data.Generations(Sim.Dex).get(4),
  'gen5': new Data.Generations(Sim.Dex).get(5),
  'gen6': new Data.Generations(Sim.Dex).get(6),
  'gen7': new Data.Generations(Sim.Dex).get(7),
  'gen8': new Data.Generations(Sim.Dex).get(8),
  'gen8bdsp': new Data.Generations(new Mods.ModdedDex(Sim.Dex.mod('gen8bdsp', ModBdsp))).get(8),
  'gen8natdex': new Data.Generations(Sim.Dex, existedEver).get(8),
}

module.exports = {names: genNames, data: genData};

