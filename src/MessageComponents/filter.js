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
  const sortKey = commandData[5] ?? 'nil';

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

  const results = (await applyFilters(toArray(data.species), filters, threshold)).sort((lhs, rhs) => {
    if(sortKey === 'nil') {
      return 0;
    }
    if(sortKey === 'bst') {
      let lhsTotal = 0;
      let rhsTotal = 0;
      ['hp','atk','def','spa','spd','spe'].forEach(el => {
        lhsTotal += lhs.baseStats[el];
        rhsTotal += rhs.baseStats[el];
      });
      return rhsTotal - lhsTotal;
    }
    return rhs.baseStats[sortKey] - lhs.baseStats[sortKey];
  });

  const pages = paginate(results.map((el)=>{return el.name}), 1000);
  const fields = interaction.message.embeds[0].fields.map(field => {
    if(field.name.startsWith('Results')) {
      return {
        name: `Results (${results.length})`,
        value: pages[pageNumber - 1],
      };
    }
    if(field.name === 'Page') {
      return {
        name: 'Page',
        value: `${pageNumber} of ${pages.length}`,
      };
    }
    return field;
  });

  return {
    type: 7,
    data: {
      embeds: [buildEmbed({
        fields: fields,
      })],
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              custom_id: pageNumber === 1 ? '-' : `filter_p${pageNumber-1}_${gen}_${threshold}_${isVgc?'V':''}_${sortKey}${packFilters(filters)}`,
              disabled: pageNumber === 1,
              style: 2,
              label: 'Previous',
            },
            {
              type: 2,
              custom_id: pageNumber === pages.length ? '-' : `filter_p${pageNumber+1}_${gen}_${threshold}_${isVgc?'V':''}_${sortKey}${packFilters(filters)}`,
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
