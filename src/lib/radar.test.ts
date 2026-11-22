import { describe, it, expect } from 'vitest';
import { findNearbyTargets, DEFAULT_RADIUS_KM, MAX_RADIUS_KM } from './radar';
import type { Restaurant } from '../types';

const base = {
  season: 1,
  episodeTitle: 'x',
  platEstrella: null,
  rating: null,
  verified: true,
  googleMapsUrl: '',
};

const user = { lat: 41.39, lng: 2.17 };

const items: Restaurant[] = [
  { ...base, id: 'winner-near', name: 'W', comarca: 'B', city: 'B', lat: 41.4, lng: 2.17, winner: true }, // ~1.1 km
  { ...base, id: 'loser-near', name: 'L', comarca: 'B', city: 'B', lat: 41.4, lng: 2.17, winner: false }, // not a target
  { ...base, id: 'badge-mid', name: 'M', comarca: 'B', city: 'B', lat: 41.42, lng: 2.17, winner: false, badge: 'Marc' }, // ~3.3 km
  { ...base, id: 'winner-far', name: 'F', comarca: 'B', city: 'B', lat: 41.6, lng: 2.17, winner: true }, // ~23 km
  { ...base, id: 'closed', name: 'C', comarca: 'B', city: 'B', lat: 41.4, lng: 2.17, winner: true, permanentlyClosed: true },
];

describe('findNearbyTargets', () => {
  it('returns only winners or badged spots inside the default radius, nearest first', () => {
    const hits = findNearbyTargets(items, user);
    expect(hits.map((h) => h.restaurant.id)).toEqual(['winner-near', 'badge-mid']);
    expect(DEFAULT_RADIUS_KM).toBe(5);
  });
  it('excludes permanently closed venues', () => {
    const ids = findNearbyTargets(items, user, 50).map((h) => h.restaurant.id);
    expect(ids).not.toContain('closed');
  });
  it('caps the radius at the maximum', () => {
    const ids = findNearbyTargets(items, user, 500).map((h) => h.restaurant.id);
    expect(ids).not.toContain('winner-far');
    expect(MAX_RADIUS_KM).toBe(10);
  });
  it('returns an empty list for a zero radius', () => {
    expect(findNearbyTargets(items, user, 0)).toEqual([]);
  });
  it('returns distances in kilometres', () => {
    const hits = findNearbyTargets(items, user);
    expect(hits[0].distanceKm).toBeGreaterThan(0);
    expect(hits[0].distanceKm).toBeLessThan(hits[1].distanceKm);
  });
});
