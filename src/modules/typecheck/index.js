'use strict';

function damageTaken(data, defenderTypes, attackerType) {
  if(defenderTypes.length > 1) {
    return defenderTypes.reduce((acc, type) => {
      return acc * damageTaken(data, [type], attackerType);
    }, 1);
  }
  const mapping = [1, 2, 0.5, 0];
  return mapping[data.types.get(defenderTypes[0]).damageTaken[data.types.get(attackerType).name]];
}

module.exports = damageTaken;
