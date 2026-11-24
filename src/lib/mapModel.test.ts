import { describe, it, expect } from 'vitest';
import { toMapMarkers, markerPopupLines } from './mapModel';
import type { Restaurant } from '../types';

const base = {
  comarca: 'Barcelonès',
  city: 'Barcelona',
  episodeTitle: 'x',
  winner: false,
  platEstrella: null,
  rating: null,
  verified: true,
  googleMapsUrl: '',
};

const items: Restaurant[] = [
  { ...base, id: 'a', name: 'A', season: 8, lat: 41.39, lng: 2.17, episodeFinalScore: 6.5, winner: true },
  { ...base, id: 'b', name: 'B', season: 9, lat: 0, lng: 0, episodeFinalScore: 8.2 },
  { ...base, id: 'c', name: 'C', season: null, lat: 41.98, lng: 2.82, episodeFinalScore: null },
];

describe('toMapMarkers', () => {
  it('keeps only restaurants with valid coordinates (no null island)', () => {
    expect(toMapMarkers(items).map((m) => m.id)).toEqual(['a', 'c']);
  });
  it('marks winners so the marker can be styled differently', () => {
    const m = toMapMarkers(items).find((x) => x.id === 'a');
    expect(m?.winner).toBe(true);
  });
  it('returns an empty list when nothing has coordinates', () => {
    expect(toMapMarkers([])).toEqual([]);
  });
});

describe('markerPopupLines', () => {
  it('includes name, comarca, town and winner state', () => {
    const lines = markerPopupLines(items[0]);
    expect(lines).toContain('A');
    expect(lines).toContain('Barcelona · Barcelonès');
    expect(lines).toContain('Guanyador');
  });
  it('shows the episode final score when known and a pending label otherwise', () => {
    expect(markerPopupLines(items[0])).toContain('Nota final: 6.5/10');
    expect(markerPopupLines(items[2])).toContain('Nota final pendent');
  });
  it('omits the winner line for non-winners', () => {
    expect(markerPopupLines(items[1])).not.toContain('Guanyador');
  });
});
