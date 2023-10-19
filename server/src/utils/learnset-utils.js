import Data from '@pkmn/data';
import gens from '#utils/gen-db';

const decodeSource = (source) => {
  const method = source[1];
  const extra = source.substr(2);

  const sourceNames = {
    D:"from the dream world",
    E:"as an egg move",
    L:"by level up",
    M:"from a TM, HM or TR",
    R:"special move",
    S:"from an event",
    T:"from a tutor",
    V:"by VC transfer",
    // Not fully convinced these are real
    X:"as an egg, traded back",
    Y:"from an event, traded back",
  };

  let result = sourceNames[method];
  if(extra !== '') {
    result += ` (${extra})`;
  }
  return result;
};

function isGen9SV(data) {
  return data.num === 9 && data !== gens.data['natdex'];
}

async function listMoves(data, pokemon, restriction) {
  const learnables = await data.learnsets.learnable(pokemon.id, restriction);

  const learnsets = [];
  for await (const l of data.learnsets.all(pokemon)) {
    learnsets.push(l);
  }

  return Object.keys(learnables)
    .filter(id => learnsets.map(l => l['learnset']?.[id])
        .flat()
        .filter(source => !!source)
        .filter(source => (!restriction && !isGen9SV(data)) || (source.startsWith(String(data.num)) && !source.endsWith('V')))
        .length > 0
    )
    .map(id=>data.moves.get(id))
    .filter(el=>!!el);
}

function getPrevo(data, pokemon, stages) {
  let currentStage = pokemon;
  for(let i = 0; i < stages; i++) {
    if(currentStage.id === 'lycanrocdusk') {
      currentStage = data.species.get('rockruff');
    } else if (currentStage.id === 'gastrodoneast') {
      currentStage = data.species.get('gastrodon');
    } else if (currentStage.id === 'pumpkaboosuper') {
      currentStage = data.species.get('pumpkaboo');
    } else {
      currentStage = data.species.get(currentStage.battleOnly || currentStage.changesFrom || currentStage.prevo);
    }
  }
  return currentStage;
}

async function checkMove(data, pokemon, move) {
  const finalSources = [];
  let latestGen = 0;
  let loopCount = -1;
  for await (const learnset of data.learnsets.all(pokemon)) {
    loopCount++;
    const sources = (learnset?.learnset?.[move.id] ?? []).filter(el => {
        return Number(el[0]) <= data.num;
    });

    if(!sources.length) {
      continue;
    }

    if(Number(sources[0][0]) < data.num && !isGen9SV(data)) {
      latestGen = Number(sources[0][0]);
      continue;
    }

    const currentStage = getPrevo(data, pokemon, loopCount);

    if(!currentStage) {
      continue;
    }

    finalSources.push(...sources.filter(el=>Number(el[0]) === data.num)
        .map(el => `- As ${currentStage.name} ${decodeSource(el)}`));
  }

  if(finalSources.length) {
    return {
      name: `${move.name}:`,
      value: finalSources.join('\n'),
    };
  } else if (latestGen > 0) {
    return {
      name: `${move.name}`,
      value: `- when transferred from Generation ${latestGen}`,
    }; 
  } else {
    return {
      name: `${move.name}:`,
      value: `- ${pokemon.name} does not learn ${move.name} in Generation ${data.num}`,
    };
  }
}

export { decodeSource, listMoves, getPrevo, checkMove };
