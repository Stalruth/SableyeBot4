'use strict';

const Dex = require('@pkmn/dex');
const Data = require('@pkmn/data');

const getarg = require('discord-getarg');
const { filterFactory, applyFilters } = require('pokemon-filters');

const command = {
  description: 'Get all Pokémon fitting the given conditions.',
  options: [
    {
      name: 'ability',
      type: 'STRING',
      description: 'Comma delimited list of Abilities.',
    },
    {
      name: 'types',
      type: 'STRING',
      description: 'Comma delimited list of types. Prefix a type with `!` to negate.',
    },
    {
      name: 'moves',
      type: 'STRING',
      description: 'Comma delimited list of moves.',
    },
    {
      name: 'hp',
      type: 'STRING',
      description: "Base HP, supports `<STAT`, `>STAT`, `STAT-STAT`",
    },
    {
      name: 'atk',
      type: 'STRING',
      description: "Base Attack, supports `<STAT`, `>STAT`, `STAT-STAT`",
    },
    {
      name: 'def',
      type: 'STRING',
      description: "Base Defence, supports `<STAT`, `>STAT`, `STAT-STAT`",
    },
    {
      name: 'spa',
      type: 'STRING',
      description: "Base Special Attack, supports `<STAT`, `>STAT`, `STAT-STAT`",
    },
    {
      name: 'spd',
      type: 'STRING',
      description: "Base Special Defence, supports `<STAT`, `>STAT`, `STAT-STAT`",
    },
    {
      name: 'spe',
      type: 'STRING',
      description: "Base Speed, supports `<STAT`, `>STAT`, `STAT-STAT`",
    },
    {
      name: 'bst',
      type: 'STRING',
      description: "Base Stat Total, supports `<STAT`, `>STAT`, `STAT-STAT`",
    },
    {
      name: 'weight-kg',
      type: 'STRING',
      description: "Weight in kg, supports `<STAT`, `>STAT`, `STAT-STAT`",
    },
    {
      name: 'egg-group',
      type: 'STRING',
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
      type: 'INTEGER',
      description: 'Amount of filters that must match. Comma-separated fields count one for each item.',
    },
    {
      name: 'gen',
      type: 'INTEGER',
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
      type: 'STRING',
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

const toArray = (data) => {
  const results = [];
  for(const i of data){
    results.push(i);
  }
  return results;
}

const process = async function(req, res) {
  const args = {
    ability: getarg(req.body, 'ability')?.value ?? undefined,
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
    egggroup: getarg(req.body, 'egg-group')?.value ?? undefined,
  };
  const isVgc = getarg(req.body, 'vgc')?.value === 'vgc';
  const gen = getarg(req.body, 'gen')?.value ?? Dex.Dex.gen;

  const data = new Data.Generations(Dex.Dex).get(gen);
  const filters = [];

  if(args['ability']) {
    const abilities = args['ability'].split(',');
    for(const ability of abilities) {
      try {
        const filter = filterFactory['ability'](data, ability);
        filters.push(filter);
      } catch {
        interaction.editReply(`The ability ${ability} could not be found in Generation ${gen}.`);
        return;
      }
    }
  }

  if(args['type']) {
    const types = args['type'].split(',');
    for(const type of types) {
      try {
        const filter = filterFactory['type'](data, type);
        filters.push(filter);
      } catch {
        interaction.editReply(`The type ${type} could not be found in Generation ${gen}.`);
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
        console.log
        interaction.editReply(`The move ${move} could not be found in Generation ${gen}.`);
        return;
      }
    }
  }

  for (const stat of ['hp','atk','def','spa','spd','spe','bst','weightkg']) {
    if(args[stat]) {
      try {
        const filter = filterFactory[stat](args[stat]);
        filters.push(filter);
      } catch(e) {
        console.log(e);
        interaction.editReply(`The query ${args[stat]} is not valid for the '${stat}' argument.`);
        return;
      }
    }
  }

  if(args['egggroup']) {
    filters.push(filterFactory['egggroup'](args['egggroup']));
  }

  if(filters.length === 0) {
    res.json('You haven\'t added any filters.');
    return;
  }

  const threshold = Math.min(getarg(req.body, 'threshold') ?? Infinity, filters.length);

  let results = await applyFilters(toArray(data.species), filters, threshold);

  const filterDescriptions = filters.map(el=>`- ${el['description']}`).join('\n');
  const thresholdDescription = threshold !== filters.length ? ` (${threshold} must match)` : '';
  const names = results.map((el)=>{return el.name}).join(', ');

  let response = `Filters${thresholdDescription}:\n${filterDescriptions}\n- - -\nResults (${results.length}):\n${names}`;

  if(response.length > 2000) {
    let response = `Filters${thresholdDescription}:\n${filterDescriptions}\n- - -\nToo many results.`;
  }
  
  res.json({
    type: 4,
    data: {
      content: response
    },
  });
};

module.exports = {command, process};

