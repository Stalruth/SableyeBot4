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

export default decodeSource;
