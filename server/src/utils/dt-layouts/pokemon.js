import { ButtonStyleTypes, InteractionResponseFlags, MessageComponentTypes } from 'discord-interactions';
import { toID } from '@pkmn/data';

import { buildEmbed } from '#utils/embed-builder';
import gens from '#utils/gen-db';
import colours from '#utils/pokemon-colours';

import { componentIDs } from './component-index.js';

function lowKickPower(weight) {
  if(weight < 10) return 20;
  if(weight < 25) return 40;
  if(weight < 50) return 60;
  if(weight < 100) return 80;
  if(weight < 200) return 100;
  return 120;
}

function pokemonInfo(pokemon, gen, page) {
  const title = `## Pokémon No. ${pokemon['num']}: ${pokemon['name']}`;
  const items = [];

  if(page === 'breeding') {
    items.push(`**Egg Group${pokemon['eggGroups'].length > 1 ? 's' : ''}**: ${pokemon['eggGroups'].join(', ')}`);

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
    items.push(`**Gender Ratio**: ${ratios.join(', ')}`);

    if(pokemon['prevo']) {
      items.push(`**Pre-evolution**: ${pokemon['prevo']}`);
    }
    if(pokemon['evos']) {
      items.push(`**Evolution${pokemon['evos'].length > 1 ? 's' : ''}**: ${pokemon['evos'].join(', ')}`);
    }
  } else {
    items.push(`**Type${pokemon['types'].length > 1 ? 's' : ''}**: ${pokemon['types'].join('/')}`);
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
      items.push(`**${abilities.length > 1 ? 'Abilities' : 'Ability'}**: ${abilities.join(', ')}`);
    }

    const statNames = ['HP', 'Atk', 'Def', ...(gens.data[gen].num <= 2 ? ['Spc'] : ['SpA', 'SpD']), 'Spe'];
    const stats = [
      pokemon.baseStats.hp,
      pokemon.baseStats.atk,
      pokemon.baseStats.def,
      ...(gens.data[gen].num <= 2 ? [
        pokemon.baseStats.spa
      ] : [
        pokemon.baseStats.spa,
        pokemon.baseStats.spd
      ]),
      pokemon.baseStats.spe
    ];
    items.push(`**${statNames.join('/')} (BST)**: ${stats.join('/')} (${stats.reduce((acc, cur) => acc + cur, 0)})`);
    items.push(`**Weight**: ${pokemon['weightkg'].toFixed(1)}kg (**Low Kick**: ${lowKickPower(pokemon['weightkg'])} BP)`);
    if(pokemon['requiredItems']) {
      items.push(`This Pokémon will always be holding${pokemon['requiredItems'].length > 1 ? ' one of' : ''} the ${pokemon['requiredItems'].join(', ')}.`);
    }
    if(pokemon['requiredAbility']) {
      items.push(`This Pokémon will always have the Ability ${pokemon['requiredAbility']}.`);
    }
    if(pokemon['battleOnly']) {
      items.push(`This Pokémon only appears in battle.`);
    }
  }

  return {
    flags: InteractionResponseFlags.IS_COMPONENTS_V2,
    components: [
      {
        type: MessageComponentTypes.CONTAINER,
        id: componentIDs.ROOT,
        accent_color: colours.types[toID(pokemon['types'][0])],
        components: [
          {
            type: MessageComponentTypes.TEXT_DISPLAY,
            content: `${title}`
          },
          {
            type: MessageComponentTypes.ACTION_ROW,
            components: [
              {
                type: MessageComponentTypes.BUTTON,
                custom_id: `${pokemon['id']}|${gen}||Pokemon`,
                style: ButtonStyleTypes.SECONDARY,
                label: 'Basic Info',
                disabled: !page
              },
              {
                type: MessageComponentTypes.BUTTON,
                custom_id: `${pokemon['id']}|${gen}|breeding|Pokemon`,
                style: ButtonStyleTypes.SECONDARY,
                label: 'Breeding',
                disabled: page === 'breeding'
              }
            ]
          },
          {
            type: MessageComponentTypes.TEXT_DISPLAY,
            content: `${items.join('\n')}`
          }
        ]
      }
    ]
  };
}

export default pokemonInfo;
