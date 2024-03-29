import { buildEmbed } from '#utils/embed-builder';
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
  const fields = [
    {
      name: 'Boosted',
      value: fullNames[nature['plus'] ? nature['plus'] : neutralNatures[nature.name]],
      inline: true,
    },
    {
      name: 'Lowered',
      value: fullNames[nature['minus'] ? nature['minus'] : neutralNatures[nature.name]],
      inline: true,
    },
  ];

  return {
    embeds: [buildEmbed({
      title,
      fields,
      color: colours.stats[nature.plus],
    })],
  };
}

export default natureInfo;
