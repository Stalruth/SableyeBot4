import { InteractionResponseType } from 'discord-interactions';

async function onPingInteraction(req, res) {
  console.log(JSON.stringify({
    interactionType: req.body.type,
  }));

  return res.json({
    type: InteractionResponseType.PONG
  });
}

export { onPingInteraction };

