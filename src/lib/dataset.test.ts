import { describe, it, expect } from 'vitest';
import data from '../../public/data/restaurants.json';
import type { Restaurant } from '../types';

const restaurants = data as Restaurant[];

describe('restaurants dataset integrity', () => {
  it('has unique ids', () => {
    const ids = restaurants.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('keeps scores within 0-10', () => {
    for (const r of restaurants) {
      for (const v of [r.marcScore, r.episodeFinalScore, r.rating]) {
        if (v !== null && v !== undefined) {
          expect(v).toBeGreaterThanOrEqual(0);
          expect(v).toBeLessThanOrEqual(10);
        }
      }
    }
  });
  it('stores phones only in a valid Spanish or Catalan format', () => {
    for (const r of restaurants) {
      if (!r.phone) continue;
      expect(r.phone, r.id).toMatch(/^\+34 \d{3} \d{2} \d{2} \d{2}$/);
    }
  });
  it('never gives the same phone to two different restaurants', () => {
    const seen = new Map<string, string>();
    for (const r of restaurants) {
      if (!r.phone) continue;
      const prev = seen.get(r.phone);
      expect(prev, `${r.id} shares ${r.phone} with ${prev}`).toBeUndefined();
      seen.set(r.phone, r.id);
    }
  });
  it('requires a source URL whenever a score is marked verified', () => {
    for (const r of restaurants) {
      if (r.marcScoreVerified) expect(r.marcScoreSource, r.id).toBeTruthy();
      if (r.marcScore !== null && r.marcScore !== undefined) expect(r.marcScoreVerified, r.id).toBe(true);
    }
  });
});
