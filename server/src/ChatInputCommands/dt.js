import { buildEmbed } from '#utils/embed-builder';

import Data from './data.js';

const definition = {
  description: 'Deprecated; use `/data` instead.',
  options: Data.definition.options,
};

async function process(interaction, respond) {
  const responder = (response) => {
    response.data.embeds.push(
      buildEmbed({
        title: "The `/dt` command has been renamed to `/data`.",
        description: `Please use \`/data\` instead of \`/dt\`; the \`/dt\` name will be removed in a future update.\n\nAll parameters remain the same otherwise.`,
        color: 0xffaa00,
      })
    );
    respond(response);
  };

  await Data.command.process(interaction, responder);
};

const autocomplete = Data.command.autocomplete;

export default {
  definition,
  command: {
    process,
    autocomplete,
  }
};

