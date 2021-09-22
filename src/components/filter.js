'use strict';

const Dex = require('@pkmn/dex');
const Data = require('@pkmn/data');

const toArray = require('dexdata-toarray');
const { filterFactory, applyFilters, packFilters } = require('pokemon-filters');
const paginate = require('paginate');

async function getPage(req, res) {

  if(req.body.member.user.id !== req.body.message.interaction.user.id) {
    res.json({
      type: 6
    });
    return;
  }

  const lines = req.body.message.content.split('\n');

  const idData = req.body.data.custom_id.split('|');
  const packedFilters = idData.slice(1);
  const commandData = idData[0].split('_');

  const pageNumber = Number(commandData[1].substring(1));
  const gen = Number(commandData[2] ?? 8);
  const data = new Data.Generations(Dex.Dex).get(gen);
  const threshold = Number(commandData[3] ?? packedFilters.length);
  const isVgc = commandData[4] === 'V';

  const filters = [];

  for(const def of packedFilters) {
    const [name, value] = def.split(':');
    filters.push(filterFactory[name](data, value, isVgc));
  }

  if(!pageNumber || isNaN(pageNumber)) {
    res.json({
      type: 6,
    });
    return;
  }

  const results = await applyFilters(toArray(data.species), filters, threshold)

  const filterDescriptions = filters.map(el=>`- ${el['description']}`).join('\n');
  const genDescription = gen !== Dex.Dex.gen ? `Using Gen ${gen}\n` : '';
  const thresholdDescription = threshold !== filters.length ? ` (${threshold} must match)` : '';
  const modeDescription = isVgc ? `VGC Mode enabled - Transfer moves excluded.\n` : '';
  const responsePrefix = `${genDescription}${modeDescription}Filters${thresholdDescription}:\n${filterDescriptions}\n- - -\nResults (${results.length}):\n`;
  const pages = paginate(results.map((el)=>{return el.name}), 1950 - responsePrefix.length);
  const names = pages[pageNumber - 1];
  const page = `Page ${pageNumber} of ${pages.length}\n`;

  res.json({
    type: 7,
    data: {
      embeds: [{
        title: `Results: ${page}`,
        description: responsePrefix + names,
        color: 0x5F32AB,
        footer: {
          text: `SableyeBot version 4.0.0-alpha`,
          icon_url: 'https://cdn.discordapp.com/avatars/211522070620667905/6b037c17fc6671f0a5dc73803a4c3338.webp',
        },
      }],
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
  });
}

module.exports = getPage;
