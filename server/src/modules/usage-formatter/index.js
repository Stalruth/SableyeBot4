import { InteractionResponseFlags, InteractionResponseType } from 'discord-interactions';
import { toID } from '@pkmn/data';
import { Smogon } from '@pkmn/smogon';
import fetch from 'node-fetch';

import { buildEmbed, buildError } from 'embed-builder';
import gens from 'gen-db';
import colours from 'pokemon-colours';
import { completePokemon, getAutocompleteHandler } from 'pokemon-complete';

function formatStats(stats) {
  return Object.keys(stats)
    .map(e=>({
      name: e,
      value: stats[e],
    }))
    .sort((lhs, rhs) => rhs.value - lhs.value)
    .slice(0,10)
    .map(e=>`${e.name}: ${(e.value * 100).toFixed(2)}%`)
    .join('\n');
}

const formatterOverrides = {
  'spreads': function(stats) {
    return Object.keys(stats)
      .map(e=>({
        name: e,
        value: stats[e],
      }))
      .sort((lhs, rhs) => rhs.value - lhs.value)
      .slice(0,10)
      .map(e=>{
        const [nature, evs] = e.name.split(':');
        return `${nature} Nature, ${evs}: ${(e.value * 100).toFixed(2)}%`;
      })
      .join('\n');
  }
};

async function formatter(format, pokemonId, statNames) {
  const smogon = new Smogon(fetch, true);
  const natdex = gens.data['natdex'];
  const pokemon = natdex.species.get(pokemonId);
  const stats = await smogon.stats(natdex, pokemon.id, toID(`${format}`));

  const fields = statNames.map(el=>({
    name: el.name,
    value: (formatterOverrides[el.field] ?? formatStats)(stats[el.field])
  }));

  return {
    embeds: [
      buildEmbed({
        title: `${pokemon.name} (${format}) - ${(stats.usage.weighted * 100).toFixed(2)}% usage`,
        fields,
        color: colours.types[toID(pokemon.types[0])],
      }),
    ],
    components: [
      {
        type: 1,
        components: [
          {
            type: 2,
            style: 2,
            label: 'Moves',
            custom_id: `${toID(format)}|${pokemon.id}|moves`,
            disabled: statNames.some(e => e.field === 'moves')
          },
          {
            type: 2,
            style: 2,
            label: 'Items',
            custom_id: `${toID(format)}|${pokemon.id}|items`,
            disabled: statNames.some(e => e.field === 'items')
          },
          {
            type: 2,
            style: 2,
            label: 'Spreads',
            custom_id: `${toID(format)}|${pokemon.id}|spreads`,
            disabled: statNames.some(e => e.field === 'spreads')
          },
          {
            type: 2,
            style: 2,
            label: 'Teammates',
            custom_id: `${toID(format)}|${pokemon.id}|teammates`,
            disabled: statNames.some(e => e.field === 'teammates')
          },
        ],
      }
    ],
  };
}

export default formatter;

