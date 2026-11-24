import { describe, it, expect } from 'vitest';
import { filterByWinner, filterByBadge } from './filters';
import type { Restaurant } from '../types';

const base = {
  comarca: 'Bages',
  city: 'Manresa',
  lat: 0,
  lng: 0,
  season: 1,
  episodeTitle: 'x',
  winner: false,
  platEstrella: null,
  rating: null,
  verified: true,
  googleMapsUrl: '',
};

const items: Restaurant[] = [
  { ...base, id: 'a', name: 'A', winner: true },
  { ...base, id: 'b', name: 'B', winner: false },
  { ...base, id: 'c', name: 'C', winner: true, badge: "Restaurant d'en Marc Ribas" },
];

describe('filterByWinner', () => {
  it('returns all items when the filter is off', () => {
    expect(filterByWinner(items, false).map((r) => r.id)).toEqual(['a', 'b', 'c']);
  });
  it('keeps only winners when on', () => {
    expect(filterByWinner(items, true).map((r) => r.id)).toEqual(['a', 'c']);
  });
});

describe('filterByBadge', () => {
  it('returns all items when the filter is off', () => {
    expect(filterByBadge(items, false).map((r) => r.id)).toEqual(['a', 'b', 'c']);
  });
  it('keeps only items with a badge when on', () => {
    expect(filterByBadge(items, true).map((r) => r.id)).toEqual(['c']);
  });
});
