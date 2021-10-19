'use strict';

const Data = require('@pkmn/data');
const Dex = require('@pkmn/dex');

const toArray = require('dexdata-toarray');
const buildEmbed = require('embed-builder');
const natDexData = require('natdexdata');
const paginate = require('paginate');
const { filterFactory, applyFilters, packFilters } = require('pokemon-filters');

async function getPage(interaction) {

  if(interaction.member.user.id !== interaction.message.interaction.user.id) {
    return {
      type: 6
    };
  }

  const lines = interaction.message.content.split('\n');

  const idData = interaction.data.custom_id.split('|');
  const packedFilters = idData.slice(1);
  const commandData = idData[0].split('_');

  const pageNumber = Number(commandData[1].substring(1));
  const gen = Number(commandData[2] ?? 8);
  const data = !isNaN(gen) ? new Data.Generations(Dex.Dex).get(gen) : natDexData;
  const threshold = Number(commandData[3] ?? packedFilters.length);
  const isVgc = commandData[4] === 'V';

  const filters = [];

  for(const def of packedFilters) {
    const [name, value] = def.split(':');
    filters.push(filterFactory[name](data, value, isVgc));
  }

  if(!pageNumber || isNaN(pageNumber)) {
    return {
      type: 6,
    };
  }

  const results = await applyFilters(toArray(data.species), filters, threshold)

  const filterDescriptions = filters.map(el=>`- ${el['description']}`).join('\n');
  const genDescription = !isNaN(gen) ? `Using Gen ${gen}\n` : '';
  const thresholdDescription = threshold !== filters.length ? ` (${threshold} must match)` : '';
  const modeDescription = isVgc ? `VGC Mode enabled - Transfer moves excluded.\n` : '';
  const responsePrefix = `${genDescription}${modeDescription}Filters${thresholdDescription}:\n${filterDescriptions}\n- - -\nResults (${results.length}):\n`;
  const pages = paginate(results.map((el)=>{return el.name}), 1950 - responsePrefix.length);
  const names = pages[pageNumber - 1];
  const page = `Page ${pageNumber} of ${pages.length}\n`;

  return {
    type: 7,
    data: {
      embeds: [buildEmbed({
        title: `Results: ${page}`,
        description: responsePrefix + names,
      })],
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              custom_id: pageNumber === 1 ? '-' : `filter_p${pageNumber-1}_${gen}_${threshold}${isVgc?'_V':''}${packFilters(filters)}`,
              disabled: pageNumber === 1,
              style: 2,
              label: 'Previous',
            },
            {
              type: 2,
              custom_id: pageNumber === pages.length ? '-' : `filter_p${pageNumber+1}_${gen}_${threshold}${isVgc?'_V':''}${packFilters(filters)}`,
              disabled: pageNumber === pages.length,
              style: 2,
              label: 'Next',
            },
          ],
        }
      ],
    },
  };
}

module.exports = getPage;
