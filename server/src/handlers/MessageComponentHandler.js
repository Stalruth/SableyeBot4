const processes = {};
const modulePaths = {};

function addComponent(name, module) {
  processes[name] = module.default;
};

async function onComponentInteraction(req, res) {
  console.log(req.body.type, req.body.guild_id, req.body.id, req.body.message.interaction.name, req.body.data.custom_id, JSON.stringify(req.body.data.values));

  const respond = (response) => {
    res.json(response)
  }

  try {
    await processes[req.body.message.interaction.name](req.body, respond);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }

  return;
}

export { addComponent, onComponentInteraction };

