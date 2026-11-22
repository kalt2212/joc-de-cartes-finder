import type { Restaurant } from '../types';
import { distanceKm } from './geo';

export const DEFAULT_RADIUS_KM = 5;
export const MAX_RADIUS_KM = 10;

export interface RadarHit {
  restaurant: Restaurant;
  distanceKm: number;
}

/**
 * Program spots within radiusKm of the user, nearest first.
 * Restricts to winners or the Marc Ribas badge, and skips permanently closed venues.
 */
export function findNearbyTargets(
  items: readonly Restaurant[],
  user: { lat: number; lng: number },
  radiusKm: number = DEFAULT_RADIUS_KM,
): RadarHit[] {
  const radius = Math.min(Math.max(radiusKm, 0), MAX_RADIUS_KM);
  return items
    .filter((r) => (r.winner || r.badge !== undefined) && r.permanentlyClosed !== true)
    .map((r) => ({ restaurant: r, distanceKm: distanceKm(user, r) }))
    .filter((h) => h.distanceKm <= radius)
    .sort((x, y) => x.distanceKm - y.distanceKm);
}
