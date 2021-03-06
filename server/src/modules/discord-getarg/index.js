function getargs(interaction) {
  const subcommand = [];
  const params = {};
  let focused = undefined;

  const processOptions = (option) => {
    if([1,2].includes(option.type)) {
      subcommand.push(option.name);
      (option.options ?? []).forEach(processOptions);
    } else {
      params[option.name] = option.value;
      if(option.focused) {
        focused = option.name;
      }
    }
  };

  (interaction.data.options ?? []).forEach(processOptions);

  return {subcommand, params, focused};
}

export default getargs;

