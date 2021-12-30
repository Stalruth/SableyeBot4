'use strict';

const { InteractionResponseFlags, InteractionResponseType } = require('discord-interactions');

const toArray = require('dexdata-toarray');
const buildEmbed = require('embed-builder');
const gens = require('gen-db');
const paginate = require('paginate');
const { filterFactory, applyFilters } = require('pokemon-filters');
const fetch = require('node-fetch');

module.exports.onFilter = async (snapshot, context) => {
  const commandData = snapshot.val();
  const gen = commandData.params.gen;
  const threshold = commandData.params.threshold;
  const isVgc = commandData.params.isVgc;
  const sortKey = commandData.params.sort;
  const filters = commandData.params.filters.map((f) => filterFactory[f.filter](gen, f.query, isVgc));

  const results = (await applyFilters(toArray(gens.data[gen].species), filters, threshold)).sort((lhs, rhs) => {
    if (!sortKey) {
      return 0;
    }
    if (sortKey === 'bst') {
      return rhs.bst - lhs.bst;
    }
    return rhs.baseStats[sortKey] - lhs.baseStats[sortKey];
  });

  const pages = paginate(results.map((el)=>{return el.name}), 1000);

  const fields = [
    {
      name: 'Filters',
      value: filters.map(el=>`- ${el['description']}`).join('\n'),
    },
    {
      name: `Results (${results.length})`,
      value: pages[0].length ? pages[0] : 'No results found.',
    },
    {
      name: 'Generation',
      value: gen,
      inline: true,
    },
    {
      name: 'Transferred Pokémon',
      value: isVgc ? 'Excluded' : 'Included',
      inline: true,
    },
  ];

  if(threshold !== filters.length) {
    fields.push({
      name: 'Threshold',
      value: `At least ${threshold} filter${threshold === 1 ? '' : 's'} must match`,
      inline: true,
    });
  }

  if(sortKey) {
    const names= {
      'hp': 'Hit Points',
      'atk': 'Attack',
      'def': 'Defence',
      'spa': 'Special Attack',
      'spd': 'Special Defence',
      'spe': 'Speed',
      'bst': 'Base Stat Total',
    };
    fields.push({
      name: 'Sorted by (High to Low)',
      value: names[sortKey],
      inline: true,
    });
  }

  const pageList = [...(new Set([
    1,
    Math.min(2, pages.length),
    pages.length
  ]))];

  const message = {
    embeds: [buildEmbed({
      fields: fields,
    })],
    components: (pages.length === 1 ? undefined : [
      {
        type: 1,
        components: pageList.map(page => ({
          type: 2,
          custom_id: page === 1 ? '-' : `${page}`,
          disabled: page === 1,
          style: 2,
          label: `Page ${page}`,
        }))
      }
    ]),
  };

  const response = fetch(`https://discord.com/api/v9/webhooks/${commandData.info.appId}/${commandData.info.token}/messages/@original`,
    {
      method: 'PATCH',
      body: JSON.stringify(message),
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  const update = pages.length === 1 ? snapshot.ref.remove() : snapshot.ref.update({ pages });

  return Promise.all([response, update]);
};
