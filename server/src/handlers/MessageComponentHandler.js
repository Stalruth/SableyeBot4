import { InteractionResponseFlags, InteractionResponseType } from 'discord-interactions';

import { buildError } from '#utils/embed-builder';

const processes = {};
const modulePaths = {};

function addComponent(name, module) {
  processes[name] = module.default;
};

async function onComponentInteraction(req, res) {
  const respond = (response) => {
    res.json(response)
  }

  // old structure so expire command
  if(!req.body.message.interaction_metadata) {
    respond({
      type: InteractionResponseType.UPDATE_MESSAGE,
      data: {
        embeds: req.body.message.embeds,
        components: []
      },
    });

    await fetch(`https://discord.com/api/v10/webhooks/${req.body.application_id}/${req.body.token}`,
      {
        method: 'POST',
        body: JSON.stringify({
          embeds: [
            buildError('This command execution has expired, please run it again.')
          ],
          flags: InteractionResponseFlags.EPHEMERAL,
        }),
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': `DiscordBot (https://github.com/Stalruth/SableyeBot4, v${process.env.npm_package_version})`,
        },
      }
    );
    return;
  }

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
    await (processes[req.body.message.interaction_metadata?.name] ?? fallbackHandler)(req.body, respond);
  } catch (e) {
    console.error(JSON.stringify({
      interactionType: req.body.type,
      guildId: req.body.guild_id,
      id: req.body.id,
      command: req.body.message.interaction_metadata?.name,
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

