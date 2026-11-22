import { describe, it, expect } from 'vitest';
import { distanceKm, sortByDistance, filterByComarca } from './geo';
import type { Restaurant } from '../types';

const base = {
  season: 1,
  episodeTitle: 'x',
  winner: false,
  platEstrella: null,
  rating: null,
  verified: false,
  googleMapsUrl: '',
};

const items: Restaurant[] = [
  { ...base, id: 'far', name: 'Far', comarca: 'Girones', city: 'Girona', lat: 41.98, lng: 2.82 },
  { ...base, id: 'near', name: 'Near', comarca: 'Barcelonès', city: 'Barcelona', lat: 41.39, lng: 2.17 },
  { ...base, id: 'mid', name: 'Mid', comarca: 'Barcelonès', city: 'Badalona', lat: 41.45, lng: 2.24 },
];

describe('distanceKm', () => {
  it('returns 0 for identical points', () => {
    expect(distanceKm({ lat: 41.39, lng: 2.17 }, { lat: 41.39, lng: 2.17 })).toBeCloseTo(0, 6);
  });
  it('is roughly 1 degree of latitude ≈ 111 km', () => {
    expect(distanceKm({ lat: 0, lng: 0 }, { lat: 1, lng: 0 })).toBeCloseTo(111.2, 0);
  });
});

describe('sortByDistance', () => {
  it('sorts ascending by distance from the user', () => {
    const sorted = sortByDistance(items, { lat: 41.39, lng: 2.17 });
    expect(sorted.map((r) => r.id)).toEqual(['near', 'mid', 'far']);
    expect(sorted[0].distanceKm).toBeLessThan(sorted[1].distanceKm);
  });
});

describe('filterByComarca', () => {
  it('returns all items when comarca is empty', () => {
    expect(filterByComarca(items, '')).toHaveLength(3);
  });
  it('keeps only the matching comarca', () => {
    expect(filterByComarca(items, 'Barcelonès').map((r) => r.id)).toEqual(['near', 'mid']);
  });
});
