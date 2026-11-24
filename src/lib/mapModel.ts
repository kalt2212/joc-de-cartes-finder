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

/** Label for permanently closed venues, or null when the venue is open. */
export function closedLabel(r: Restaurant): string | null {
  return r.permanentlyClosed ? 'Tancat definitivament' : null;
}

/** Text lines shown in a marker popup. Keeps the same wording as the list cards. */
export function markerPopupLines(r: Restaurant): string[] {
  const lines = [r.name, `${r.city} · ${r.comarca}`];
  if (r.winner) lines.push('Guanyador');
  const closed = closedLabel(r);
  if (closed) lines.push(closed);
  if (r.episodeFinalScore !== null && r.episodeFinalScore !== undefined) {
    lines.push(`Nota final: ${r.episodeFinalScore}/10`);
  } else {
    lines.push('Nota final pendent');
  }
  if (r.marcScoreVerified && r.marcScore !== null && r.marcScore !== undefined) {
    lines.push(`Marc Ribas: ${r.marcScore}/10`);
  }
  return lines;
}

/**
 * Offsets points that share exact coordinates onto a small deterministic ring so each pin is
 * clickable. Unique points are returned unchanged. The input is never mutated.
 */
export function spreadStackedMarkers<T extends { id: string; lat: number; lng: number }>(points: readonly T[]): T[] {
  const groups = new Map<string, number>();
  return points.map((p) => {
    const key = `${p.lat},${p.lng}`;
    const k = groups.get(key) ?? 0;
    groups.set(key, k + 1);
    if (k === 0) return { ...p };
    const angle = (k * 2 * Math.PI) / 6;
    const radius = 0.0015 * Math.ceil(k / 6);
    return { ...p, lat: p.lat + radius * Math.sin(angle), lng: p.lng + radius * Math.cos(angle) };
  });
}
