'use strict';

const Dex = require('@pkmn/dex');
const Data = require('@pkmn/data');

const toArray = require('dexdata-toarray');
const { getarg } = require('discord-getarg');
const paginate = require('paginate');
const { filterFactory, applyFilters, packFilters } = require('pokemon-filters');

const command = {
  description: 'Get all Pokémon fitting the given conditions.',
  options: [
    {
      name: 'abilities',
      type: 3,
      description: 'Comma delimited list of Abilities.',
    },
    {
      name: 'types',
      type: 3,
      description: 'Comma delimited list of types. Prefix a type with `!` to negate.',
    },
    {
      name: 'moves',
      type: 3,
      description: 'Comma delimited list of moves.',
    },
    {
      name: 'hp',
      type: 3,
      description: "Base HP, supports `<STAT`, `>STAT`, `STAT-STAT`",
    },
    {
      name: 'atk',
      type: 3,
      description: "Base Attack, supports `<STAT`, `>STAT`, `STAT-STAT`",
    },
    {
      name: 'def',
      type: 3,
      description: "Base Defence, supports `<STAT`, `>STAT`, `STAT-STAT`",
    },
    {
      name: 'spa',
      type: 3,
      description: "Base Special Attack, supports `<STAT`, `>STAT`, `STAT-STAT`",
    },
    {
      name: 'spd',
      type: 3,
      description: "Base Special Defence, supports `<STAT`, `>STAT`, `STAT-STAT`",
    },
    {
      name: 'spe',
      type: 3,
      description: "Base Speed, supports `<STAT`, `>STAT`, `STAT-STAT`",
    },
    {
      name: 'bst',
      type: 3,
      description: "Base Stat Total, supports `<STAT`, `>STAT`, `STAT-STAT`",
    },
    {
      name: 'weight-kg',
      type: 3,
      description: "Weight in kg, supports `<STAT`, `>STAT`, `STAT-STAT`",
    },
    {
      name: 'weaknesses',
      type: 3,
      description: "Comma delimited list of Weaknesses."
    },
    {
      name: 'resists',
      type: 3,
      description: "Comma delimited list of Resistances."
    },
    {
      name: 'egg-group',
      type: 3,
      description: 'Egg Group the Pokémon is in.',
      choices: [
        {
          name: 'Amorphous',
          value: 'Amorphous',
        },
        {
          name: 'Bug',
          value: 'Bug',
        },
        {
          name: 'Dragon',
          value: 'Dragon',
        },
        {
          name: 'Ditto',
          value: 'Ditto',
        },
        {
          name: 'Fairy',
          value: 'Fairy',
        },
        {
          name: 'Field',
          value: 'Field',
        },
        {
          name: 'Flying',
          value: 'Flying',
        },
        {
          name: 'Grass',
          value: 'Grass',
        },
        {
          name: 'Human-Like',
          value: 'Human-Like',
        },
        {
          name: 'Mineral',
          value: 'Mineral',
        },
        {
          name: 'Monster',
          value: 'Monster',
        },
        {
          name: 'Undiscovered',
          value: 'Undiscovered',
        },
        {
          name: 'Water 1',
          value: 'Water 1',
        },
        {
          name: 'Water 2',
          value: 'Water 2',
        },
        {
          name: 'Water 3',
          value: 'Water 3',
        },
      ],
    },
    {
      name: 'threshold',
      type: 4,
      description: 'Amount of filters that must match. Comma-separated fields count one for each item.',
    },
    {
      name: 'gen',
      type: 4,
      description: 'The Generation used in calculation',
      choices: [
        {
          name: 'RBY',
          value: 1,
        },
        {
          name: 'GSC',
          value: 2,
        },
        {
          name: 'RSE',
          value: 3,
        },
        {
          name: 'DPPt/HGSS',
          value: 4,
        },
        {
          name: 'BW/BW2',
          value: 5,
        },
        {
          name: 'XY/ORAS',
          value: 6,
        },
        {
          name: 'SM/USM',
          value: 7,
        },
        {
          name: 'SwSh',
          value: 8,
        },
      ]
    },
    {
      name: 'mode',
      type: 3,
      description: 'Limit search to current generation.',
      choices: [
        {
          name: 'VGC',
          value: 'vgc',
        },
        {
          name: 'Default',
          value: 'default',
        },
      ],
    },
  ],
};

const process = async function(req, res) {
  const args = {
    ability: getarg(req.body, 'abilities')?.value ?? undefined,
    type: getarg(req.body, 'types')?.value ?? undefined,
    move: getarg(req.body, 'moves')?.value ?? undefined,
    hp: getarg(req.body, 'hp')?.value ?? undefined,
    atk: getarg(req.body, 'atk')?.value ?? undefined,
    def: getarg(req.body, 'def')?.value ?? undefined,
    spa: getarg(req.body, 'spa')?.value ?? undefined,
    spa: getarg(req.body, 'spd')?.value ?? undefined,
    spe: getarg(req.body, 'spe')?.value ?? undefined,
    bst: getarg(req.body, 'bst')?.value ?? undefined,
    weightkg: getarg(req.body, 'weight-kg')?.value ?? undefined,
    weakness: getarg(req.body, 'weaknesses')?.value ?? undefined,
    resist: getarg(req.body, 'resists')?.value ?? undefined,
    egggroup: getarg(req.body, 'egg-group')?.value ?? undefined,
  };
  const isVgc = getarg(req.body, 'mode')?.value === 'vgc';
  const gen = getarg(req.body, 'gen')?.value ?? Dex.Dex.gen;

  const data = new Data.Generations(Dex.Dex).get(gen);
  const filters = [];

  if(args['ability']) {
    const abilities = args['ability'].split(',');
    for(const ability of abilities) {
      try {
        const filter = filterFactory['ability'](data, ability, isVgc);
        filters.push(filter);
      } catch {
        res.json({
          type: 4,
          data: {
            content: `The ability ${ability} could not be found in Generation ${gen}.`,
            flags: 1<< 6,
          },
        });
        return;
      }
    }
  }

  if(args['type']) {
    const types = args['type'].split(',');
    for(const type of types) {
      try {
        const filter = filterFactory['type'](data, type, isVgc);
        filters.push(filter);
      } catch {
        res.json({
          type: 4,
          data: {
            content: `The type ${type} could not be found in Generation ${gen}.`,
            flags: 1<< 6,
          },
        });
        return;
      }
    }
  }

  if(args['move']) {
    const moves = args['move'].split(',');
    for(const move of moves) {
      try {
        const filter = filterFactory['move'](data, move, isVgc);
        filters.push(filter);
      } catch {
        res.json({
          type: 4,
          data: {
            content: `The move ${move} could not be found in Generation ${gen}.`,
            flags: 1<< 6,
          },
        });
        return;
      }
    }
  }

  for (const stat of ['hp','atk','def','spa','spd','spe','bst','weightkg']) {
    if(args[stat]) {
      try {
        const filter = filterFactory[stat](data, args[stat], isVgc);
        filters.push(filter);
      } catch(e) {
        res.json({
          type: 4,
          data: {
            content: `The query ${args[stat]} is not valid for the '${stat}' argument.`,
            flags: 1<< 6,
          },
        });
        return;
      }
    }
  }

  if(args['weakness']) {
    const types = args['weakness'].split(',');
    for(const type of types) {
      try {
        const filter = filterFactory['weakness'](data, type, isVgc);
        filters.push(filter);
      } catch {
        res.json({
          type: 4,
          data: {
            content: `The type ${type} could not be found in Generation ${gen}.`,
            flags: 1<< 6,
          },
        });
        return;
      }
    }
  }

  if(args['resist']) {
    const types = args['resist'].split(',');
    for(const type of types) {
      try {
        const filter = filterFactory['resist'](data, type, isVgc);
        filters.push(filter);
      } catch {
        res.json({
          type: 4,
          data: {
            content: `The type ${type} could not be found in Generation ${gen}.`,
            flags: 1<< 6,
          },
        });
        return;
      }
    }
  }

  if(args['egggroup']) {
    filters.push(filterFactory['egggroup'](data, args['egggroup']), isVgc);
  }

  if(filters.length === 0) {
    res.json({
      type: 4,
      data: {
        content: 'You haven\'t added any filters.',
        flags: 1<< 6,
      },
    });
    return;
  }

  const threshold = Math.min(getarg(req.body, 'threshold')?.value ?? Infinity, filters.length);

  const results = await applyFilters(toArray(data.species), filters, threshold);

  const filterDescriptions = filters.map(el=>`- ${el['description']}`).join('\n');
  const genDescription = gen !== Dex.Dex.gen ? `Using Gen ${gen}\n` : '';
  const thresholdDescription = threshold !== filters.length ? ` (${threshold} must match)` : '';
  const modeDescription = isVgc ? `VGC Mode enabled - Transfer moves excluded.\n` : '';
  const responsePrefix = `${genDescription}${modeDescription}Filters${thresholdDescription}:\n${filterDescriptions}\n- - -\nResults (${results.length}):\n`;
  const pages = paginate(results.map((el)=>{return el.name}), 1950 - responsePrefix.length);
  const names = pages[0];
  const page = pages.length === 1 ? '' : `Page 1 of ${pages.length}\n`;

  res.json({
    type: 4,
    data: {
      content: responsePrefix + page + names,
      components: (pages.length === 1 ? undefined : [
        {
          type: 1,
          components: [
            {
              type: 2,
              custom_id: '-',
              disabled: true,
              style: 2,
              label: 'Previous',
            },
            {
              type: 2,
              custom_id:`filter_p2_${gen}_${threshold}${isVgc ?'_V':''}${packFilters(filters)}`,
              style: 2,
              label: 'Next',
            },
          ],
        }
      ]),
    },
  });
};

module.exports = {command, process};

