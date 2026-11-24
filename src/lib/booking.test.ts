import { describe, it, expect } from 'vitest';
import { bookingUrl, bookingLabel, callUrl, contactAction, withAffiliate } from './booking';
import type { Restaurant } from '../types';

const base: Restaurant = {
  id: 'x', name: 'Casa Ràfols', comarca: 'Barcelonès', city: 'Barcelona', lat: 41.39, lng: 2.18,
  season: 5, episodeTitle: 't', winner: false, platEstrella: null, rating: null, verified: true,
  googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=x', marcScore: null,
  marcScoreSource: null, marcScoreVerified: false, episodeFinalScore: null, episodeScoreSource: null,
};

describe('bookingUrl', () => {
  it('builds a TheFork search URL with the encoded name by default', () => {
    expect(bookingUrl(base)).toBe('https://www.thefork.cat/search?q=Casa%20R%C3%A0fols');
  });
  it('falls back to Google Maps search when the restaurant is permanently closed', () => {
    const url = bookingUrl({ ...base, permanentlyClosed: true });
    expect(url).toBe(base.googleMapsUrl);
  });
  it('uses the stored Google Maps URL as the fallback for closed venues', () => {
    expect(bookingUrl({ ...base, permanentlyClosed: true, googleMapsUrl: 'https://maps.example/x' })).toBe('https://maps.example/x');
  });
  it('encodes special characters in the name', () => {
    expect(bookingUrl({ ...base, name: "L'Italianini & Co" })).toBe("https://www.thefork.cat/search?q=L'Italianini%20%26%20Co");
  });
});

describe('bookingLabel', () => {
  it('uses Reservar for open venues', () => {
    expect(bookingLabel(base)).toBe('Reservar taula');
  });
  it('uses Veure al mapa for permanently closed venues', () => {
    expect(bookingLabel({ ...base, permanentlyClosed: true })).toBe('Veure al mapa');
  });
});

describe('callUrl', () => {
  it('returns a tel: link with the phone digits, spaces stripped', () => {
    expect(callUrl({ ...base, phone: '+34 936 25 82 00' })).toBe('tel:+34936258200');
  });
  it('returns null when there is no phone', () => {
    expect(callUrl(base)).toBeNull();
  });
  it('returns null for a permanently closed venue even with a phone', () => {
    expect(callUrl({ ...base, phone: '+34 936 25 82 00', permanentlyClosed: true })).toBeNull();
  });
});

describe('contactAction', () => {
  it('calls the phone when one is known', () => {
    expect(contactAction({ ...base, phone: '+34 936 25 82 00' })).toEqual({
      kind: 'call',
      label: 'Trucar',
      href: 'tel:+34936258200',
    });
  });
  it('falls back to a Google Maps search when the phone is missing', () => {
    const a = contactAction(base);
    if (a === null) throw new Error('expected a contact action');
    expect(a.kind).toBe('maps');
    expect(a.label).toBe('Buscar telèfon');
    expect(a.href).toContain('https://www.google.com/maps/search/');
    expect(a.href).toContain(encodeURIComponent('Casa Ràfols Barcelona'));
  });
  it('hides the action for permanently closed venues', () => {
    expect(contactAction({ ...base, permanentlyClosed: true })).toBeNull();
  });
});

describe('affiliate booking', () => {
  const base = { id: 'x', name: 'Casa Rafols', comarca: 'Barcelonès', city: 'Barcelona', lat: 41.4, lng: 2.1, season: null,
    episodeTitle: '', winner: false, platEstrella: null, rating: null, verified: true } as Restaurant;

  it('uses the plain TheFork search when no affiliate id is configured', () => {
    expect(bookingUrl(base, undefined)).toBe('https://www.thefork.cat/search?q=Casa%20Rafols');
  });

  it('appends the affiliate parameter when an affiliate id is configured', () => {
    const u = new URL(bookingUrl(base, 'ABC123'));
    expect(u.origin + u.pathname).toBe('https://www.thefork.cat/search');
    expect(u.searchParams.get('q')).toBe('Casa Rafols');
    expect(u.searchParams.get('affiliate')).toBe('ABC123');
  });

  it('prefers a confirmed direct booking link over the search, with affiliate', () => {
    const r = { ...base, bookingUrl: 'https://www.thefork.cat/restaurant/casa-rafols-r123' } as Restaurant;
    expect(bookingUrl(r, 'ABC123')).toBe('https://www.thefork.cat/restaurant/casa-rafols-r123?affiliate=ABC123');
  });

  it('keeps a direct link free of duplicate affiliate params', () => {
    const r = { ...base, bookingUrl: 'https://www.thefork.cat/restaurant/x?affiliate=OLD' } as Restaurant;
    expect(bookingUrl(r, 'NEW')).toBe('https://www.thefork.cat/restaurant/x?affiliate=NEW');
  });

  it('labels a confirmed direct link as a direct booking', () => {
    const r = { ...base, bookingUrl: 'https://www.thefork.cat/restaurant/x-r1' } as Restaurant;
    expect(bookingLabel(r)).toBe('Reservar directament');
  });

  it('keeps the generic label for the search fallback', () => {
    expect(bookingLabel(base)).toBe('Reservar taula');
  });
});
