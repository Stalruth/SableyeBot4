const decodeSource = (source) => {
  const method = source[1];
  const extra = source.substr(2);

  const sourceNames = {
    D:"From the dream world",
    E:"As an egg move",
    L:"By level up",
    M:"From a TM, HM or TR",
    R:"Special move",
    S:"From an event",
    T:"From a tutor",
    V:"By VC transfer",
    // Not fully convinced these are real
    X:"As an egg, traded back",
    Y:"From an event, traded back",
  };

  let result = sourceNames[method];
  if(extra !== '') {
    result += ` (${extra})`;
  }
  return result;
};

module.exports = decodeSource;
