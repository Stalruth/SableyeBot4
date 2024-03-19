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
    command: req.body.message.interaction_metadata.name,
    params: {
      custom_id: req.body.data.custom_id,
      values: req.body.data.values,
    }
  }));

  const respond = (response) => {
    res.json(response)
  }

  const fallbackHandler = (interaction, respond) => {
    respond({
      type: InteractionResponseType.UPDATE_MESSAGE,
      data: {
        embeds: interaction.message.embeds,
        components: []
      },
    });
  }

  try {
    await (processes[req.body.message.interaction_metadata.name] ?? fallbackHandler)(req.body, respond);
  } catch (e) {
    console.error(JSON.stringify({
      interactionType: req.body.type,
      guildId: req.body.guild_id,
      id: req.body.id,
      command: req.body.message.interaction_metadata.name,
      params: {
        custom_id: req.body.data.custom_id,
        values: req.body.data.values,
      }
    }));
    console.error(e);
  }

  return;
}

export { addComponent, onComponentInteraction };

