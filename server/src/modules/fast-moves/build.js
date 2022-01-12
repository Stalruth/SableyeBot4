// TODO: make this write to file

'use strict';

const gens = require('gen-db');

async function getMoveMap(data, restriction) {
  const moves = Object.create(null);
  for(const move of data.moves) {
    const learners = Object.create(null);
    for(const pokemon of data.species) {
      if(await data.learnsets.canLearn(pokemon.id, move, restriction)) {
        learners[pokemon.id] = true;
      }
    }
    moves[move.id] = learners;
  }
  return moves;
}

const vgc = {
  'gen6': 'Pentagon',
  'gen7': 'Clover',
  'gen8': 'Galar',
};

async function main() {
  const generations = Object.create(null);

  const mapFunctions = [
    'gen1',
    'gen2',
    'gen3',
    'gen4',
    'gen5',
    'gen6',
    'gen7',
    'gen8',
    'gen8bdsp',
    'gen8natdex'
  ].map((gen) => {
    const results = [];
    const data = gens.data[gen];
    results.push(async function() {generations[gen] = await getMoveMap(data)});
    if(vgc[gen]) {
      results.push(async function() {generations[vgc[gen]] = await getMoveMap(data, vgc[data.num])});
    }
    return results;
  }).flat()
  .map(e=>e());
  
  await Promise.allSettled(mapFunctions);
  console.log(mapFunctions);
  return generations;
}

module.exports = main;

