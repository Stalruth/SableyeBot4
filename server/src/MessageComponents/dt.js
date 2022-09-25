import { buildEmbed } from '#utils/embed-builder';

import Data from './data.js';

async function process(interaction, respond) {
  const innerRespond = (response) => {
    const result = response;
    result.data.embeds.push(
      buildEmbed({
        title: "The `/dt` command has been renamed to `/data`.",
        description: `Please use \`/data\` instead of \`/dt\`; the \`/dt\` name will be removed in a future update.\n\nAll parameters remain the same otherwise.`,
        color: 0xffaa00,
      })
    );
    return respond(result);
  }
  return Data(interaction, innerRespond);

};

export default process;

