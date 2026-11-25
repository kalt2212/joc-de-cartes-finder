import { describe, it, expect } from 'vitest';
import { bookingUrl, callUrl, contactAction } from './booking';
import { mapsUrl } from './geo';
import type { Restaurant } from '../types';

// Every restaurant state the UI can render. Each action href must be a real https or tel: target.
const base: Restaurant = {
  id: 'x', name: 'Casa Ràfols', comarca: 'Barcelonès', city: 'Barcelona', lat: 41.39, lng: 2.18,
  season: 5, episodeTitle: 't', winner: false, platEstrella: null, rating: null, verified: true,
  googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=x', marcScore: null,
  marcScoreSource: null, marcScoreVerified: false, episodeFinalScore: null, episodeScoreSource: null,
};

const states: [string, Partial<Restaurant>][] = [
  ['complete', { phone: '+34 936 25 82 00', bookingUrl: 'https://www.thefork.cat/r/abc', website: 'https://x.cat' }],
  ['no phone', { phone: undefined }],
  ['no bookingUrl', { bookingUrl: undefined }],
  ['no googleMapsUrl', { googleMapsUrl: '' }],
  ['permanently closed', { permanentlyClosed: true, phone: '+34 936 25 82 00' }],
  ['closed without maps url', { permanentlyClosed: true, googleMapsUrl: '' }],
  ['phone with no digits', { phone: 'n/a' }],
  ['empty phone', { phone: '' }],
];

function isSafeHref(href: string | null | undefined): boolean {
  if (!href) return false;
  if (href.startsWith('tel:')) return /^tel:\+?\d{6,}$/.test(href);
  try {
    return new URL(href).protocol === 'https:';
  } catch {
    return false;
  }
}

describe('every action button has a safe target in every restaurant state', () => {
  for (const [label, over] of states) {
    const r = { ...base, ...over } as Restaurant;
    it(`${label}: call action`, () => {
      const a = contactAction(r);
      if (a !== null) expect(isSafeHref(a.href)).toBe(true);
    });
    it(`${label}: booking link`, () => {
      expect(isSafeHref(bookingUrl(r))).toBe(true);
    });
    it(`${label}: maps link`, () => {
      expect(isSafeHref(r.googleMapsUrl || mapsUrl(r.name, r.city))).toBe(true);
    });
  }
  it('callUrl never returns an empty tel: link', () => {
    const u = callUrl({ ...base, phone: 'n/a' });
    expect(u === null || /^tel:\+?\d{6,}$/.test(u)).toBe(true);
  });
});
