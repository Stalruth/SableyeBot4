'use strict';
const Data = require('@pkmn/data');
const Sim = require('@pkmn/sim');

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

function getGen(dex, gen, existsFn) {
  if(existsFn) {
    return new Data.Generations(dex, existsFn).get(gen);
  }
  return new Data.Generations(dex).get(gen);
}

const genData = {
  get ['gen1']() {
    delete genData['gen1'];
    return genData['gen1'] = getGen(Sim.Dex, 1);
  },
  get ['gen2']() {
    delete genData['gen2'];
    return genData['gen2'] = getGen(Sim.Dex, 2);
  },
  get ['gen3']() {
    delete genData['gen3'];
    return genData['gen3'] = getGen(Sim.Dex, 3);
  },
  get ['gen4']() {
    delete genData['gen4'];
    return genData['gen4'] = getGen(Sim.Dex, 4);
  },
  get ['gen5']() {
    delete genData['gen5'];
    return genData['gen5'] = getGen(Sim.Dex, 5);
  },
  get ['gen6']() {
    delete genData['gen6'];
    return genData['gen6'] = getGen(Sim.Dex, 6);
  },
  get ['gen7']() {
    delete genData['gen7'];
    return genData['gen7'] = getGen(Sim.Dex, 7);
  },
  get ['gen8']() {
    delete genData['gen8'];
    return genData['gen8'] = getGen(Sim.Dex, 8);
  },
  get ['gen8bdsp']() {
    const Mods = require('@pkmn/mods');
    const ModBdsp = require('@pkmn/mods/gen8bdsp');

    delete genData['gen8bdsp'];
    return genData['gen8bdsp'] = getGen(new Mods.ModdedDex(Sim.Dex.mod('gen8bdsp', ModBdsp)), 8);
  },
  get ['gen8natdex']() {
    delete genData['gen8natdex'];
    return genData['gen8natdex'] = getGen(Sim.Dex, 8, existedEver);
  },
}

module.exports = {names: genNames, data: genData};

