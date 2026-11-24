import { describe, it, expect } from 'vitest';
import { filterBySeason, sortByScore } from './filters';
import type { Restaurant } from '../types';

const base = {
  comarca: 'Barcelonès',
  city: 'Barcelona',
  lat: 41.39,
  lng: 2.17,
  episodeTitle: 'x',
  winner: false,
  platEstrella: null,
  rating: null,
  verified: true,
  googleMapsUrl: '',
};

const items: Restaurant[] = [
  { ...base, id: 'a', name: 'A', season: 8, episodeFinalScore: 6.5 },
  { ...base, id: 'b', name: 'B', season: 9, episodeFinalScore: 8.2 },
  { ...base, id: 'c', name: 'C', season: null, episodeFinalScore: null },
  { ...base, id: 'd', name: 'D', season: 8, episodeFinalScore: 7.9 },
];

describe('filterBySeason', () => {
  it('returns all items when season is null', () => {
    expect(filterBySeason(items, null).map((r) => r.id)).toEqual(['a', 'b', 'c', 'd']);
  });
  it('keeps only the given season', () => {
    expect(filterBySeason(items, 8).map((r) => r.id)).toEqual(['a', 'd']);
  });
  it('excludes unknown season when a season is chosen', () => {
    expect(filterBySeason(items, 9).map((r) => r.id)).toEqual(['b']);
  });
});

describe('sortByScore', () => {
  it('sorts by episodeFinalScore descending, unknown scores last', () => {
    expect(sortByScore(items).map((r) => r.id)).toEqual(['b', 'd', 'a', 'c']);
  });
  it('does not mutate the input', () => {
    const before = items.map((r) => r.id);
    sortByScore(items);
    expect(items.map((r) => r.id)).toEqual(before);
  });
});
