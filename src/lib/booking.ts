import type { Restaurant } from '../types';
import { mapsUrl } from './geo';

/** Booking entry point: TheFork search for the name, or the Google Maps link for closed venues. */
export function bookingUrl(r: Restaurant): string {
  if (r.permanentlyClosed) return r.googleMapsUrl;
  return `https://www.thefork.cat/search?q=${encodeURIComponent(r.name)}`;
}

/** Button label that matches what the link does. */
export function bookingLabel(r: Restaurant): string {
  return r.permanentlyClosed ? 'Veure al mapa' : 'Reservar taula';
}

/** Phone link (tel:) for the call button. Null when no phone is known or the venue is closed. */
export function callUrl(r: Restaurant): string | null {
  if (r.permanentlyClosed || !r.phone) return null;
  return `tel:${r.phone.replace(/[^+\d]/g, '')}`;
}

export type ContactAction =
  | { kind: 'call'; label: string; href: string }
  | { kind: 'maps'; label: string; href: string };

/**
 * One contact button per card: call when a phone is known, otherwise a Google Maps search for it.
 * Null for permanently closed venues, where neither makes sense.
 */
export function contactAction(r: Restaurant): ContactAction | null {
  if (r.permanentlyClosed) return null;
  const tel = callUrl(r);
  if (tel) return { kind: 'call', label: 'Trucar', href: tel };
  return { kind: 'maps', label: 'Buscar telèfon', href: mapsUrl(r.name, r.city) };
}
