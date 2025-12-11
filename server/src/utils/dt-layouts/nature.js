import { InteractionResponseFlags, MessageComponentTypes } from 'discord-interactions';
import colours from '#utils/pokemon-colours';

// Uh oh sisters! hardcoding!
const neutralNatures = {
  'Hardy': 'atk',
  'Docile': 'def',
  'Bashful': 'spa',
  'Quirky': 'spd',
  'Serious': 'spe',
};

const fullNames = {
  'atk': 'Attack',
  'def': 'Defence',
  'spa': 'Special Attack',
  'spd': 'Special Defence',
  'spe': 'Speed',
};

function natureInfo(nature) {
  const title = `Nature: ${nature.name}`;

  return {
    flags: InteractionResponseFlags.IS_COMPONENTS_V2,
    components: [
      {
        type: MessageComponentTypes.CONTAINER,
        accent_color: colours.stats[nature.plus ?? neutralNatures[nature.name]],
        components: [
          {
            type: MessageComponentTypes.TEXT_DISPLAY,
            content: `# ${title}\n- Boosts ${fullNames[nature['plus'] ?? neutralNatures[nature.name]]}\n- Lowers ${fullNames[nature['minus'] ?? neutralNatures[nature.name]]}`
          }
        ]
      }
    ]
  };
}

export default natureInfo;

