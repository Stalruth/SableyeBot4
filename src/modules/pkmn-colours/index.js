'use strict';

const types = {
  normal: 0xA8A878,
  fighting: 0xC03028,
  flying: 0xA890F0,
  poison: 0xA040A0,
  ground: 0xE0C068,
  rock: 0xB8A038,
  bug: 0xA8B820,
  ghost: 0x705898,
  steel: 0xB8B8D0,
  fire: 0xF08030,
  water: 0x6890F0,
  grass: 0x78C850,
  electric: 0xF8D030,
  psychic: 0xF85888,
  ice: 0x98D8D8,
  dragon: 0x7038F8,
  dark: 0x705848,
  fairy: 0xEE99AC,
};

const stats = {
  hp: 0xff0000,
  atk: 0xf08030,
  def: 0xf8d030,
  spa: 0x6890f0,
  spd: 0x78C850,
  spe: 0xf85888,
};

module.exports = { types, stats };

