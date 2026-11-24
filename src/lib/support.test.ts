import { describe, it, expect } from 'vitest';
import { supportUrl, isSponsored, sponsoredFirst } from './support';
import type { Restaurant } from '../types';

const base = {
  id: 'x', name: 'X', comarca: 'Barcelonès', city: 'Barcelona', lat: 41.4, lng: 2.1, season: null,
  episodeTitle: '', winner: false, platEstrella: null, rating: null, verified: true,
  googleMapsUrl: 'https://maps.google.com/?q=x', marcScore: null,
} as Restaurant;

describe('supportUrl', () => {
  it('returns null when no support link is configured', () => {
    expect(supportUrl(undefined)).toBeNull();
    expect(supportUrl('')).toBeNull();
  });

  it('returns the configured https link', () => {
    expect(supportUrl('https://ko-fi.com/example')).toBe('https://ko-fi.com/example');
  });

  it('rejects links that are not https', () => {
    expect(supportUrl('javascript:alert(1)')).toBeNull();
    expect(supportUrl('http://ko-fi.com/example')).toBeNull();
  });
});

describe('isSponsored', () => {
  it('is false when the flag is missing or false', () => {
    expect(isSponsored(base)).toBe(false);
    expect(isSponsored({ ...base, sponsored: false } as Restaurant)).toBe(false);
  });

  it('is true only when the flag is explicitly true', () => {
    expect(isSponsored({ ...base, sponsored: true } as Restaurant)).toBe(true);
  });
});

describe('sponsoredFirst', () => {
  it('keeps the relative order when nothing is sponsored', () => {
    const a = { ...base, id: 'a' } as Restaurant;
    const b = { ...base, id: 'b' } as Restaurant;
    expect(sponsoredFirst([a, b]).map((r) => r.id)).toEqual(['a', 'b']);
  });

  it('moves sponsored restaurants to the top without reordering the rest', () => {
    const a = { ...base, id: 'a' } as Restaurant;
    const s = { ...base, id: 's', sponsored: true } as Restaurant;
    const b = { ...base, id: 'b' } as Restaurant;
    expect(sponsoredFirst([a, s, b]).map((r) => r.id)).toEqual(['s', 'a', 'b']);
  });

  it('does not mutate the input', () => {
    const a = { ...base, id: 'a' } as Restaurant;
    const s = { ...base, id: 's', sponsored: true } as Restaurant;
    const input = [a, s];
    sponsoredFirst(input);
    expect(input.map((r) => r.id)).toEqual(['a', 's']);
  });
});
