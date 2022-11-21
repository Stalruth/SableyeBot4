import Data from '@pkmn/data';
import Sim from '@pkmn/sim';

const existedEver = (d) => {
  if (!d.exists) return false;
  if ('isNonstandard' in d && ![null, 'Past', 'Future', 'LGPE', 'Gigantamax'].includes(d.isNonstandard)) return false;
  if (d.kind === 'Ability' && d.id === 'noability') return false;
  return !('tier' in d && d.tier === 'Unreleased');
};

const existsInGen = (d) => {
  if (!d.exists) return false;
  if ('isNonstandard' in d && ![null, 'Gigantamax'].includes(d.isNonstandard)) return false;
  if (d.kind === 'Ability' && d.id === 'noability') return false;
  return !('tier' in d && ['Illegal', 'Unreleased'].includes(d.tier));
}

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
    name: 'Sword/Shield: Crown Tundra',
    value: 'gen8',
  },
  {
    name: 'Scarlet/Violet',
    value: 'gen9',
  },
  {
    name: 'National Dex',
    value: 'natdex',
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
    return genData['gen1'] = getGen(Sim.Dex, 1, existsInGen);
  },
  get ['gen2']() {
    delete genData['gen2'];
    return genData['gen2'] = getGen(Sim.Dex, 2, existsInGen);
  },
  get ['gen3']() {
    delete genData['gen3'];
    return genData['gen3'] = getGen(Sim.Dex, 3, existsInGen);
  },
  get ['gen4']() {
    delete genData['gen4'];
    return genData['gen4'] = getGen(Sim.Dex, 4, existsInGen);
  },
  get ['gen5']() {
    delete genData['gen5'];
    return genData['gen5'] = getGen(Sim.Dex, 5, existsInGen);
  },
  get ['gen6']() {
    delete genData['gen6'];
    return genData['gen6'] = getGen(Sim.Dex, 6, existsInGen);
  },
  get ['gen7']() {
    delete genData['gen7'];
    return genData['gen7'] = getGen(Sim.Dex, 7, existsInGen);
  },
  get ['gen8']() {
    delete genData['gen8'];
    return genData['gen8'] = getGen(Sim.Dex, 8, existsInGen);
  },
  get ['gen9']() {
    delete genData['gen9'];
    return genData['gen9'] = getGen(Sim.Dex, 9, existsInGen);
  },
  get ['natdex']() {
    delete genData['natdex'];
    return genData['natdex'] = getGen(Sim.Dex, 9, existedEver);
  },
}

export default {names: genNames, data: genData};

