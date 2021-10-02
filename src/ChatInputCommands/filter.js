'use strict';

const Dex = require('@pkmn/dex');
const Data = require('@pkmn/data');

const toArray = require('dexdata-toarray');
const { getargs } = require('discord-getarg');
const paginate = require('paginate');
const { filterFactory, applyFilters, packFilters } = require('pokemon-filters');
const buildEmbed = require('embed-builder');

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
  const args = getargs(req.body).params;

  const data = !!args.gen ? new Data.Generations(Dex.Dex).get(args.gen) : Dex.Dex;
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
    filters.push(filterFactory['egggroup'](data, args['egg-group']), args.move === 'vgc');
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

module.exports = {command, process};

