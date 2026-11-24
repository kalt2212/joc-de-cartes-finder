import { describe, it, expect } from 'vitest';
import { toMapMarkers, markerPopupLines, spreadStackedMarkers, closedLabel } from './mapModel';
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
    expect(toMapMarkers(items).find((x) => x.id === 'a')?.winner).toBe(true);
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
  it('adds the closed line when permanently closed', () => {
    const r = { ...items[1], permanentlyClosed: true } as Restaurant;
    expect(markerPopupLines(r)).toContain('Tancat definitivament');
  });
  it('shows Marc Ribas score when verified', () => {
    const r = { ...items[1], marcScore: 8, marcScoreVerified: true } as Restaurant;
    expect(markerPopupLines(r)).toContain('Marc Ribas: 8/10');
  });
  it('omits Marc Ribas line when not verified', () => {
    const r = { ...items[1], marcScore: 8, marcScoreVerified: false } as Restaurant;
    expect(markerPopupLines(r).some((l) => l.startsWith('Marc Ribas'))).toBe(false);
  });
});

describe('closedLabel', () => {
  it('returns a label only for permanently closed restaurants', () => {
    expect(closedLabel({ ...items[1], permanentlyClosed: true } as Restaurant)).toBe('Tancat definitivament');
    expect(closedLabel(items[1])).toBeNull();
  });
});

describe('spreadStackedMarkers', () => {
  it('leaves unique coordinates untouched', () => {
    const pts = [{ id: 'a', lat: 41, lng: 2 }, { id: 'b', lat: 42, lng: 3 }];
    expect(spreadStackedMarkers(pts)).toEqual(pts);
  });
  it('separates identical coordinates into distinct points', () => {
    const pts = [{ id: 'a', lat: 41.3851, lng: 2.1734 }, { id: 'b', lat: 41.3851, lng: 2.1734 }, { id: 'c', lat: 41.3851, lng: 2.1734 }];
    const keys = new Set(spreadStackedMarkers(pts).map((p) => `${p.lat},${p.lng}`));
    expect(keys.size).toBe(3);
  });
  it('is deterministic for the same input', () => {
    const pts = [{ id: 'a', lat: 41, lng: 2 }, { id: 'b', lat: 41, lng: 2 }];
    expect(spreadStackedMarkers(pts)).toEqual(spreadStackedMarkers(pts));
  });
  it('keeps every id and does not mutate the input', () => {
    const pts = [{ id: 'a', lat: 41, lng: 2 }, { id: 'b', lat: 41, lng: 2 }];
    const out = spreadStackedMarkers(pts);
    expect(out.map((p) => p.id)).toEqual(['a', 'b']);
    expect(pts[0].lat).toBe(41);
  });
});
