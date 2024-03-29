import { ButtonStyleTypes, InteractionResponseFlags, MessageComponentTypes } from 'discord-interactions';
import { toID } from '@pkmn/data';

import { buildEmbed } from '#utils/embed-builder';
import gens from '#utils/gen-db';
import colours from '#utils/pokemon-colours';

function lowKickPower(weight) {
  if(weight < 10) return 20;
  if(weight < 25) return 40;
  if(weight < 50) return 60;
  if(weight < 100) return 80;
  if(weight < 200) return 100;
  return 120;
}

function pokemonInfo(pokemon, gen, verbose) {
  const title = `Pokémon No. ${pokemon['num']}: ${pokemon['name']}`;
  const fields = [];
  fields.push({
    name: `Type${pokemon['types'].length > 1 ? 's' : ''}`,
    value: pokemon['types'].join('/'),
  });

  if(gens.data[gen].num >= 3) {
    const abilities = [pokemon['abilities'][0]]
    if(pokemon['abilities'][1]) {
      abilities.push(pokemon['abilities'][1]);
    }
    if(pokemon['abilities']['H'] && !pokemon['unreleasedHidden']) {
      abilities.push(pokemon['abilities']['H'] + ' (Hidden)');
    }
    if(pokemon['abilities']['S']) {
      abilities.push(pokemon['abilities']['S'] + ' (Special)');
    }
    fields.push({
      name: 'Abilities',
      value: abilities.join(', '),
    });
  }

  const statNames = ['HP', 'Atk', 'Def', ...(gens.data[gen].num <= 2 ? ['Spc'] : ['SpA', 'SpD']), 'Spe']
  const stats = [
    pokemon.baseStats.hp,
    pokemon.baseStats.atk,
    pokemon.baseStats.def,
    ...(gens.data[gen].num === 1 ? [
      pokemon.baseStats.spa
    ] : [
      pokemon.baseStats.spa,
      pokemon.baseStats.spd
    ]),
    pokemon.baseStats.spe
  ];
  fields.push({
    name: `${statNames.join('/')}`,
    value: `${stats.join('/')}`,
    inline: true,
  },
  {
    name: 'Total',
    value: stats.reduce((ac, el) => ac + el),
    inline: true,
  });

  if(verbose) {
    fields.push({
      name: 'Weight (Low Kick BP)',
      value: `${pokemon['weightkg']}kg (${lowKickPower(pokemon['weightkg'])} BP)`,
      inline: true,
    },
    {
      name: 'Height',
      value: `${pokemon['heightm']}m`,
      inline: true,
    },
    {
      name: 'Introduced',
      value: `Generation ${pokemon['gen']}`,
    });
  }

  if(pokemon['baseSpecies'] !== pokemon['name']) {
    fields.push({
      name: 'Base Species',
      value: pokemon['baseSpecies'],
      inline: true,
    });
  }

  if(pokemon['otherFormes']) {
    fields.push({
      name: 'Other Formes',
      value: pokemon['otherFormes'].join(', '),
      inline: true,
    });
  }

  if(verbose) {
    if(pokemon['prevo']) {
      fields.push({
        name: 'Pre-evolution',
        value: pokemon['prevo'],
        inline: true,
      });
    }
    if(pokemon['evos']) {
      fields.push({
        name: `Evolution${pokemon['evos'].length > 1 ? 's' : ''}`,
        value: pokemon['evos'].join(', '),
        inline: true,
      });
    }

    const genderRatio = {
      'M': pokemon['genderRatio']['M'] * 100,
      'F': pokemon['genderRatio']['F'] * 100,
      'N/A': pokemon['genderRatio']['M'] + pokemon['genderRatio']['F'] === 0 ? 100 : 0
    };
    let ratios = [];
    ['M','F','N/A'].forEach((el) => {
      if(genderRatio[el] > 0) {
        ratios.push(`${el}: ${genderRatio[el]}%`);
      }
    });
    
    fields.push({
      name: 'Egg groups',
      value: pokemon['eggGroups'].join(', '),
      inline: true,
    },
    {
      name: 'Gender Ratio',
      value: ratios.join(', '),
      inline: true,
    });

    if(pokemon['requiredItems']) {
      fields.push({
        name: 'Required Item',
        value: pokemon['requiredItems'].join(', '),
      });
    }

    if(pokemon['requiredAbility']) {
      fields.push({
        name: 'Required Ability',
        value: pokemon['requiredAbility'],
      });
    }

    if(pokemon['eventOnly']) {
      fields.push({
        name: 'Event Only',
        value: 'This Pokémon is only available through events.',
      });
    }

    if(pokemon['battleOnly']) {
      fields.push({
        name: 'Battle Only',
        value: 'This Pokémon only appears in battle.',
      });
    }

    fields.push({
      name: 'Color',
      value: pokemon['color'],
    });
  }

  return {
    embeds: [buildEmbed({
      title,
      fields,
      color: colours.types[toID(pokemon.types[0])]
    })],
    components: [{
      type: MessageComponentTypes.ACTION_ROW,
      components: [{
        type: MessageComponentTypes.BUTTON,
        custom_id: `${pokemon['id']}|${gen}|${!verbose ? 'true' : ''}|Pokemon`,
        style: ButtonStyleTypes.SECONDARY,
        label: !verbose ? 'Show More' : 'Show Less',
      }],
    }],
  };
}

export default pokemonInfo;
