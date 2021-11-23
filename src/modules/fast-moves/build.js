// TODO: make this write to file

'use strict';

const Dex = require('@pkmn/dex');
const Data = require('@pkmn/data');

const natDexData = require('natdexdata');

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

[1,2,3,4,5,6,7,8].forEach(async (gen) => {
  const data = new Data.Generations(Dex.Dex).get(gen);
  console.time(gen);
  generations[gen] = await getMoveMap(data);
  if(vgc[gen]) {
    console.log(vgc[gen]);
    generations[vgc[gen]] = await getMoveMap(data, vgc[gen]);
  }
  console.timeEnd(gen);
});

(async () => {
  console.time('natdex');
  generations['natdex'] = await getMoveMap(natDexData);
  console.timeEnd('natdex');
})();

module.exports = generations;
