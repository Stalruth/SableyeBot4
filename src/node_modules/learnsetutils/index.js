const decodeSource = (source) => {
  const method = source[1];
  const extra = source.substr(2);

  const sourceNames = {
    E:"As an egg move",
    D:"From the dream world",
    S:"From an event",
    L:"By level up",
    M:"From a TM, HM or TR",
    T:"From a tutor",
    X:"As an egg, traded back",
    Y:"From an event, traded back",
    V:"By VC transfer"
  };

  let result = sourceNames[method];
  if(extra !== '') {
    result += ` (${extra})`;
  }
  return result;
};

module.exports = decodeSource;
