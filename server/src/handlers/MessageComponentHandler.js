const processes = {};
const modulePaths = {};

function addComponent(name, module) {
  processes[name] = module.default;
};

async function onComponentInteraction(req, res) {
  console.log(JSON.stringify({
    interactionType: req.body.type,
    guildId: req.body.guild_id,
    id: req.body.id,
    command: req.body.message.interaction.name,
    params: {
      custom_id: req.body.data.custom_id,
      values: req.body.data.values,
    }
  }));

  const respond = (response) => {
    res.json(response)
  }

  try {
    await processes[req.body.message.interaction.name](req.body, respond);
  } catch (e) {
    console.error(JSON.stringify({
      interactionType: req.body.type,
      guildId: req.body.guild_id,
      id: req.body.id,
      command: req.body.message.interaction.name,
      params: {
        custom_id: req.body.data.custom_id,
        values: req.body.data.values,
      }
    }));
    console.error(e);
    res.sendStatus(500);
  }

  return;
}

export { addComponent, onComponentInteraction };

