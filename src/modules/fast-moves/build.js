// TODO: make this write to file

'use strict';

const Sim = require('@pkmn/sim');
const Data = require('@pkmn/data');

const gens = require('gen-db');

const generations = Object.create(null);

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
  6: 'Pentagon',
  7: 'Clover',
  8: 'Galar',
};

[
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
].forEach(async (gen) => {
  const data = gens.data[gen];
  generations[gen] = await getMoveMap(data);
  if(vgc[gen]) {
    generations[vgc[data.num]] = await getMoveMap(data, vgc[data.num]);
  }
});

module.exports = generations;
