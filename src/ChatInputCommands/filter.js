'use strict';

const Data = require('@pkmn/data');
const Dex = require('@pkmn/dex');

const dataSearch = require('datasearch');
const toArray = require('dexdata-toarray');
const getargs = require('discord-getarg');
const buildEmbed = require('embed-builder');
const natDexData = require('natdexdata');
const paginate = require('paginate');
const { completeAbility, completeFilterType, completeMove, completeType } = require('pkmn-complete');
const { filterFactory, applyFilters, packFilters } = require('pokemon-filters');

const command = {
  description: 'Get all Pokémon fitting the given conditions.',
  options: [
    {
      name: 'abilities',
      type: 3,
      description: 'Comma delimited list of Abilities.',
      autocomplete: true,
    },
    {
      name: 'types',
      type: 3,
      description: 'Comma delimited list of types. Prefix a type with `!` to negate.',
      autocomplete: true,
    },
    {
      name: 'moves',
      type: 3,
      description: 'Comma delimited list of moves.',
      autocomplete: true,
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
      description: "Comma delimited list of Weaknesses.",
      autocomplete: true,
    },
    {
      name: 'resists',
      type: 3,
      description: "Comma delimited list of Resistances.",
      autocomplete: true,
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
  const args = getargs(req.body).params;

  const data = !!args.gen ? new Data.Generations(Dex.Dex).get(args.gen) : natDexData;
  const filters = [];

  if(args.abilities) {
    const abilities = args.abilities.split(',');
    for(const ability of abilities) {
      try {
        const filter = filterFactory['ability'](data, ability, args.mode === 'vgc');
        filters.push(filter);
      } catch {
        res.json({
          type: 4,
          data: {
            embeds: [buildEmbed({
              title: "Error",
              description: `The ability ${ability} could not be found in Generation ${args.gen ?? Dex.Dex.gen}.`,
              color: 0xCC0000,
            })],
            flags: 1 << 6,
          },
        });
        return;
      }
    }
  }

  if(args.types) {
    const types = args.types.split(',');
    for(const type of types) {
      try {
        const filter = filterFactory['type'](data, type.trimStart(), args.mode === 'vgc');
        filters.push(filter);
      } catch {
        res.json({
          type: 4,
          data: {
            embeds: [buildEmbed({
              title: "Error",
              description: `The type ${type} could not be found in Generation ${args.gen ?? Dex.Dex.gen}.`,
              color: 0xCC0000,
            })],
            flags: 1 << 6,
          },
        });
        return;
      }
    }
  }

  if(args.moves) {
    const moves = args.moves.split(',');
    for(const move of moves) {
      try {
        const filter = filterFactory['move'](data, move, args.move === 'vgc');
        filters.push(filter);
      } catch {
        res.json({
          type: 4,
          data: {
            embeds: [buildEmbed({
              title: "Error",
              description: `The move ${move} could not be found in Generation ${args.gen ?? Dex.Dex.gen}.`,
              color: 0xCC0000,
            })],
            flags: 1 << 6,
          },
        });
        return;
      }
    }
  }

  for (const stat of ['hp','atk','def','spa','spd','spe','bst']) {
    if(args[stat]) {
      try {
        const filter = filterFactory[stat](data, args[stat], args.move === 'vgc');
        filters.push(filter);
      } catch(e) {
        res.json({
          type: 4,
          data: {
            embeds: [buildEmbed({
              title: "Error",
              description: `The query ${args[stat]} is not valid for the '${stat}' argument.`,
              color: 0xCC0000,
            })],
            flags: 1 << 6,
          },
        });
        return;
      }
    }
  }

  if(args['weight-kg']) {
    try {
      const filter = filterFactory['weightkg'](data, args['weight-kg'], args.move === 'vgc');
      filters.push(filter);
    } catch(e) {
      res.json({
        type: 4,
        data: {
          embeds: [buildEmbed({
            title: "Error",
            description: `The query ${args['weight-kg']} is not valid for the 'weight-kg' argument.`,
            color: 0xCC0000,
          })],
          flags: 1 << 6,
        },
      });
      return;
    }
  }

  if(args.weaknesses) {
    const types = args.weaknesses.split(',');
    for(const type of types) {
      try {
        const filter = filterFactory['weakness'](data, type, args.move === 'vgc');
        filters.push(filter);
      } catch {
        res.json({
          type: 4,
          data: {
            embeds: [buildEmbed({
              title: "Error",
              description: `The type ${type} could not be found in Generation ${args.gen ?? Dex.Dex.gen}.`,
              color: 0xCC0000,
            })],
            flags: 1 << 6,
          },
        });
        return;
      }
    }
  }

  if(args.resists) {
    const types = args.resists.split(',');
    for(const type of types) {
      try {
        const filter = filterFactory['resist'](data, type, args.move === 'vgc');
        filters.push(filter);
      } catch {
        res.json({
          type: 4,
          data: {
            embeds: [buildEmbed({
              title: "Error",
              description: `The type ${type} could not be found in Generation ${args.gen ?? Dex.Dex.gen}.`,
              color: 0xCC0000,
            })],
            flags: 1 << 6,
          },
        });
        return;
      }
    }
  }

  if(args['egg-group']) {
    filters.push(filterFactory['egggroup'](data, args['egg-group'], args.move === 'vgc'));
  }

  if(filters.length === 0) {
    res.json({
      type: 4,
      data: {
        embeds: [buildEmbed({
          title: "Error",
          description: "You haven't added any filters.",
          color: 0xCC0000,
        })],
        flags: 1 << 6,
      },
    });
    return;
  }

  const threshold = args.threshold ?? filters.length;
  
  console.log(filters);

  const results = await applyFilters(toArray(data.species), filters, threshold);

  const filterDescriptions = filters.map(el=>`- ${el['description']}`).join('\n');
  const genDescription = !!args.gen ? `Using Gen ${args.gen}\n` : '';
  const thresholdDescription = threshold !== filters.length ? ` (${threshold} must match)` : '';
  const modeDescription = args.mode === 'vgc' ? `VGC Mode enabled - Transfer moves excluded.\n` : '';
  const responsePrefix = `${genDescription}${modeDescription}Filters${thresholdDescription}:\n${filterDescriptions}\n- - -\nResults (${results.length}):\n`;
  const pages = paginate(results.map((el)=>{return el.name}), 1950 - responsePrefix.length);
  const names = pages[0];
  const page = pages.length === 1 ? '' : `Page 1 of ${pages.length}\n`;

  res.json({
    type: 4,
    data: {
      embeds: [buildEmbed({
        title: `Results: ${page}`,
        description: responsePrefix + names,
      })],
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
              custom_id:`filter_p2_${args.gen ?? 'NaN'}_${threshold}${args.mode === 'vgc' ?'_V':''}${packFilters(filters)}`,
              style: 2,
              label: 'Next',
            },
          ],
        }
      ]),
    },
  });
};

function autocomplete(req, res) {
  const {params: args, focused} = getargs(req.body);

  const autoArg = args[focused];
  const completers = {
    'abilities': completeAbility,
    'types': completeFilterType,
    'moves': completeMove,
    'weaknesses': completeType,
    'resists': completeType,
  };
  const searches = {
    'abilities': 'abilities',
    'types': 'types',
    'moves': 'moves',
    'weaknesses': 'types',
    'resists': 'types',
  };

  const items = autoArg.split(',')
    .map(e => {
      const negate = e.startsWith('!') ? '!' : '';
      return `${negate}${Data.toID(e)}`
    });
  const current = items.pop();
  const resolved = items.map((e) => {
    const item = dataSearch(Dex.Dex[searches[focused]], e)?.result;
    if(!item) {
      return null;
    }
    const negated = e.startsWith('!') ? '!' : '';
    return {
      id: `${negated}${item.id}`,
      name: `${negated}${item.name}`,
    };
  });

  if(resolved.some(e=>!e)) {
    res.json({
      type: 8,
      data: {
        choices: [],
      },
    });
    return;
  }

  const prefix = resolved.reduce((acc,cur) => {
    return {
      name: `${acc.name}${cur.name}, `,
      value: `${acc.value}${cur.id},`,
    };
  }, {name:'',value:''});

  res.json({
    type: 8,
    data: {
      choices: completers[focused](current)
      .map(e=>{
        return {
          name: `${prefix.name}${e.name}`,
          value: `${prefix.value}${e.value}`,
        };
      }),
    },
  });
}

module.exports = {command, process, autocomplete};

