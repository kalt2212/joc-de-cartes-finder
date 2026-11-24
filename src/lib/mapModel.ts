import type { Restaurant } from '../types';

export interface MapMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  winner: boolean;
}

/** Keeps restaurants that have real coordinates. Rejects the 0,0 placeholder ("null island"). */
export function toMapMarkers<T extends Restaurant>(items: readonly T[]): MapMarker[] {
  return items
    .filter((r) => Number.isFinite(r.lat) && Number.isFinite(r.lng) && !(r.lat === 0 && r.lng === 0))
    .map((r) => ({ id: r.id, name: r.name, lat: r.lat, lng: r.lng, winner: r.winner }));
}

/** Text lines shown in a marker popup. Keeps the same wording as the list cards. */
export function markerPopupLines(r: Restaurant): string[] {
  const lines = [r.name, `${r.city} · ${r.comarca}`];
  if (r.winner) lines.push('Guanyador');
  if (r.episodeFinalScore !== null && r.episodeFinalScore !== undefined) {
    lines.push(`Nota final: ${r.episodeFinalScore}/10`);
  } else {
    lines.push('Nota final pendent');
  }
  return lines;
}
