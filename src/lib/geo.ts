import type { Restaurant } from '../types';

const EARTH_RADIUS_KM = 6371;

/** Great-circle distance in kilometres between two lat/lng points (haversine). */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function sortByDistance<T extends Restaurant>(items: T[], from: { lat: number; lng: number }): (T & { distanceKm: number })[] {
  return items
    .map((r) => ({ ...r, distanceKm: distanceKm(from, r) }))
    .sort((x, y) => x.distanceKm - y.distanceKm);
}

export function filterByComarca<T extends Restaurant>(items: T[], comarca: string): T[] {
  if (!comarca) return items;
  return items.filter((r) => r.comarca === comarca);
}

export function mapsUrl(name: string, city: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${city}`)}`;
}
