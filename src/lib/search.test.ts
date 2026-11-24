import { describe, it, expect } from 'vitest';
import { normalize, tokenize, editDistance, searchRestaurants } from './search';
import type { Restaurant } from '../types';

const base = {
  season: 1,
  episodeTitle: 'x',
  winner: false,
  platEstrella: null,
  rating: null,
  verified: true,
  googleMapsUrl: '',
};

const items: Restaurant[] = [
  { ...base, id: 'tikus', name: 'La Cuina d en Tikus', comarca: 'Bages', city: 'Castellgali', lat: 0, lng: 0, winner: true, platEstrella: 'Galta al Josper amb ximiurri', episodeTitle: 'T10xC3 - restaurant a la fresca' },
  { ...base, id: 'ciri', name: 'La Taverna del Ciri', comarca: 'Vallès Occidental', city: 'Terrassa', lat: 0, lng: 0, verified: false, badge: "Restaurant d'en Marc Ribas", note: 'Restaurant del presentador' },
  { ...base, id: 'gaig', name: 'Restaurant Gaig', comarca: 'Barcelonès', city: 'Barcelona', lat: 0, lng: 0, winner: true },
];

describe('normalize and tokenize', () => {
  it('lowercases, strips diacritics and punctuation', () => {
    expect(normalize('Vallès Occidental!')).toBe('valles occidental');
    expect(normalize("L'Hivernacle")).toBe('l hivernacle');
  });
  it('returns no tokens for blank input', () => {
    expect(tokenize('   ')).toEqual([]);
    expect(tokenize('')).toEqual([]);
  });
});

describe('editDistance', () => {
  it('computes Levenshtein distance', () => {
    expect(editDistance('kitten', 'sitting')).toBe(3);
    expect(editDistance('abc', 'abc')).toBe(0);
    expect(editDistance('', 'abc')).toBe(3);
  });
});

describe('searchRestaurants', () => {
  it('returns nothing for an empty query', () => {
    expect(searchRestaurants(items, '  ')).toEqual([]);
  });
  it('matches accent-insensitively', () => {
    expect(searchRestaurants(items, 'valles').map((h) => h.restaurant.id)).toEqual(['ciri']);
  });
  it('matches a star dish by its words', () => {
    expect(searchRestaurants(items, 'josper').map((h) => h.restaurant.id)).toEqual(['tikus']);
  });
  it('matches by prefix', () => {
    expect(searchRestaurants(items, 'terr').map((h) => h.restaurant.id)).toEqual(['ciri']);
  });
  it('tolerates a single typo in words of five or more letters', () => {
    expect(searchRestaurants(items, 'Castelgali').map((h) => h.restaurant.id)).toEqual(['tikus']);
  });
  it('requires every query token to match', () => {
    expect(searchRestaurants(items, 'gaig barcelona')).toHaveLength(1);
    expect(searchRestaurants(items, 'gaig terrassa')).toHaveLength(0);
  });
  it('finds the Marc Ribas badge and note', () => {
    expect(searchRestaurants(items, 'presentador').map((h) => h.restaurant.id)).toEqual(['ciri']);
  });
  it('ranks name matches above note matches', () => {
    const hits = searchRestaurants(items, 'restaurant');
    expect(hits[0].restaurant.id).toBe('gaig');
  });
});

describe('searchRestaurants field coverage', () => {
  it('matches a town name on its own', () => {
    expect(searchRestaurants(items, 'castellgali').map((h) => h.restaurant.id)).toEqual(['tikus']);
  });
  it('matches a comarca name on its own', () => {
    expect(searchRestaurants(items, 'bages').map((h) => h.restaurant.id)).toEqual(['tikus']);
  });
  it('matches the Marc Ribas dish by one word', () => {
    expect(searchRestaurants(items, 'ximiurri').map((h) => h.restaurant.id)).toEqual(['tikus']);
  });
  it('returns nothing when no field matches', () => {
    expect(searchRestaurants(items, 'sushi')).toEqual([]);
  });
});
