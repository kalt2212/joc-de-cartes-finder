import { describe, it, expect } from 'vitest';
import data from '../../public/data/restaurants.json';
import type { Restaurant } from '../types';

const restaurants = data as Restaurant[];
const URL_RE = /^https:\/\/[^\s]+$/;

describe('dataset provenance', () => {
  it('every winner has a valid https source URL', () => {
    for (const r of restaurants.filter((x) => x.winner)) {
      expect(r.sourceUrl, r.id).toMatch(URL_RE);
    }
  });
  it('every verified record has a valid https source URL', () => {
    for (const r of restaurants.filter((x) => x.verified)) {
      expect(r.sourceUrl ?? '', r.id).toMatch(URL_RE);
    }
  });
});
