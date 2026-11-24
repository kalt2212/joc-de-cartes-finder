import { describe, it, expect } from 'vitest';
import { bookingUrl, bookingLabel } from './booking';
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
