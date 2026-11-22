import { describe, it, expect } from 'vitest';
import {
  computeUserScore,
  compareWithOfficial,
  buildShareText,
  isValidCriterion,
  parseStoredScores,
  serializeScores,
} from './scoring';

const base = { menjar: 8, servei: 6, espai: 7, cuina: 9, preu: 5, platEstrella: false };

describe('isValidCriterion', () => {
  it('accepts 0 through 10 inclusive', () => {
    expect(isValidCriterion(0)).toBe(true);
    expect(isValidCriterion(10)).toBe(true);
    expect(isValidCriterion(5.5)).toBe(true);
  });
  it('rejects out of range and non-finite values', () => {
    expect(isValidCriterion(-0.1)).toBe(false);
    expect(isValidCriterion(10.1)).toBe(false);
    expect(isValidCriterion(Number.NaN)).toBe(false);
    expect(isValidCriterion(Number.POSITIVE_INFINITY)).toBe(false);
  });
});

describe('computeUserScore', () => {
  it('returns the arithmetic mean of the five criteria', () => {
    expect(computeUserScore(base)).toBe(7);
  });
  it('adds the star-dish bonus', () => {
    expect(computeUserScore({ ...base, platEstrella: true })).toBe(7.5);
  });
  it('caps the total at 10', () => {
    const max = { menjar: 10, servei: 10, espai: 10, cuina: 10, preu: 10, platEstrella: true };
    expect(computeUserScore(max)).toBe(10);
  });
  it('handles all zeros with and without bonus', () => {
    const zero = { menjar: 0, servei: 0, espai: 0, cuina: 0, preu: 0, platEstrella: false };
    expect(computeUserScore(zero)).toBe(0);
    expect(computeUserScore({ ...zero, platEstrella: true })).toBe(0.5);
  });
  it('rounds to one decimal', () => {
    const s = { menjar: 7, servei: 7, espai: 7, cuina: 8, preu: 8, platEstrella: false };
    expect(computeUserScore(s)).toBe(7.4);
  });
  it('throws on an out-of-range criterion', () => {
    expect(() => computeUserScore({ ...base, menjar: 11 })).toThrow(RangeError);
    expect(() => computeUserScore({ ...base, preu: Number.NaN })).toThrow(RangeError);
  });
});

describe('compareWithOfficial', () => {
  it('returns the signed difference rounded to one decimal', () => {
    expect(compareWithOfficial(7.5, 6.9)).toBe(0.6);
    expect(compareWithOfficial(6, 7.7)).toBe(-1.7);
  });
  it('returns null when no official rating exists', () => {
    expect(compareWithOfficial(7, null)).toBeNull();
  });
});

describe('buildShareText', () => {
  it('includes the name, user score and official rating', () => {
    const text = buildShareText('La Taverna del Codina', 7.5, 6.9);
    expect(text).toContain('La Taverna del Codina');
    expect(text).toContain('7.5/10');
    expect(text).toContain('nota oficial 6.9/10');
  });
  it('handles a missing official rating', () => {
    expect(buildShareText('X', 5, null)).toContain('sense nota oficial');
  });
});

describe('serializeScores / parseStoredScores', () => {
  const saved = { 'r-1': { menjar: 8, servei: 6, espai: 7, cuina: 9, preu: 5, platEstrella: true } };

  it('round-trips a map of scores', () => {
    expect(parseStoredScores(serializeScores(saved))).toEqual(saved);
  });
  it('returns an empty map for missing or malformed payloads', () => {
    expect(parseStoredScores(null)).toEqual({});
    expect(parseStoredScores('not json')).toEqual({});
    expect(parseStoredScores('[1,2]')).toEqual({});
    expect(parseStoredScores('null')).toEqual({});
  });
  it('drops entries with invalid criteria or a missing flag', () => {
    const raw = JSON.stringify({
      good: { menjar: 1, servei: 1, espai: 1, cuina: 1, preu: 1, platEstrella: false },
      outOfRange: { menjar: 11, servei: 1, espai: 1, cuina: 1, preu: 1, platEstrella: false },
      noFlag: { menjar: 1, servei: 1, espai: 1, cuina: 1, preu: 1 },
      text: 'nope',
    });
    expect(Object.keys(parseStoredScores(raw))).toEqual(['good']);
  });
});
