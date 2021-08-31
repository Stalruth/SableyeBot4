'use strict';

const Dex = require('@pkmn/dex');
const Data = require('@pkmn/data');

const toArray = require('dexdata-toarray');
const { filterFactory, applyFilters } = require('pokemon-filters');
const paginate = require('paginate');

async function getPage(req, res) {
  const lines = req.body.message.content.split('\n');
  let pageNumber = undefined;
  const filters = [];

  let data = new Data.Generations(Dex.Dex).get(8);
  let gen = 8;
  let isVgc = false;
  let threshold = null;


  for(const line of lines) {
    let match = null;
    if(match = line.match(/Using gen (\d+)/)) {
      gen = Number(match[1]);
      data = new Data.Generations(Dex.Dex).get(gen);
    } else if(match = line.match(/VGC Mode enabled/)) {
      isVgc = true;
    } else if(match = line.match(/Filters \((\d+) must match\):/)) {
      threshold = Number(match[1]);
      console.log(threshold);
    } else if(match = line.match(/- Has the ability (.+)/)) {
      filters.push(filterFactory.ability(data, match[1]));
    } else if(match = line.match(/- Is (.+)-type/)) {
      filters.push(filterFactory.type(data, match[1]));
    } else if(match = line.match(/- Has the move (.+)/)) {
      filters.push(filterFactory.move(data, match[1], isVgc));
    } else if(match = line.match(/- Has an? (.+) (?:greater|lower|between|of)/)) {
      const shortStats = {
        'HP stat': 'hp',
        'Attack stat': 'atk',
        'Defence stat': 'def',
        'Special Attack stat': 'spa',
        'Special Defence stat': 'spd',
        'Speed stat': 'spe',
        'Weight': 'weightkg',
        'Base Stat Total': 'bst',
      };
      const statAbbr = shortStats[match[1]];
      if(match = line.match(/greater than (\d+)/)) {
        filters.push(filterFactory[statAbbr]('>' + match[1]));
      } else if(match = line.match(/lower than (\d+)/)) {
        filters.push(filterFactory[statAbbr]('<' + match[1]));
      } else if(match = line.match(/of (\d+)/)) {
        filters.push(filterFactory[statAbbr](match[1]));
      } else if(match = line.match(/between (\d+) and (\d+)/)) {
        filters.push(filterFactory[statAbbr](match[1] + '-' + match[2]));
      }
    } else if (match = line.match(/- Is in the (.+) egg group/)) {
      filters.push(filterFactory.egggroup(match[1]));
    } else if(match = line.match(/Page ([\d]+)/)) {
      const currentPage = Number(match[1]);
      pageNumber = currentPage + (req.body.data.custom_id.endsWith('next') ? 1 : -1);
    }
  }

  if(!threshold) {
    threshold = filters.length;
  }

  if(!pageNumber) {
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
      content: responsePrefix + page + names,
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              custom_id: 'filter_prev',
              disabled: pageNumber === 1,
              style: 2,
              label: 'Previous',
            },
            {
              type: 2,
              custom_id:`filter_next`,
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
