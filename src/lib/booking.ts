import type { Restaurant } from '../types';
import { mapsUrl } from './geo';

/** TheFork affiliate id. Set VITE_AFFILIATE_ID at build time; empty means no tracking param. */
export const AFFILIATE_ID: string | undefined = (import.meta.env.VITE_AFFILIATE_ID as string | undefined) || undefined;

/** Adds or replaces the affiliate parameter. Returns the URL unchanged when no id is configured. */
export function withAffiliate(url: string, affiliateId: string | undefined): string {
  if (!affiliateId) return url;
  const u = new URL(url);
  u.searchParams.set('affiliate', affiliateId);
  return u.toString();
}

/**
 * Booking entry point. Closed venues go to the map. A confirmed direct TheFork link is used when
 * present; otherwise a TheFork search by name. The affiliate id, when set, is appended to either.
 */
export function bookingUrl(r: Restaurant, affiliateId: string | undefined = AFFILIATE_ID): string {
  if (r.permanentlyClosed) return r.googleMapsUrl || mapsUrl(r.name, r.city);
  if (r.bookingUrl) return withAffiliate(r.bookingUrl, affiliateId);
  return withAffiliate(`https://www.thefork.cat/search?q=${encodeURIComponent(`${r.name} ${r.city}`)}`, affiliateId);
}

/** Button label that matches what the link does. */
export function bookingLabel(r: Restaurant): string {
  if (r.permanentlyClosed) return 'Veure al mapa';
  return r.bookingUrl ? 'Reservar a TheFork' : 'Buscar a TheFork';
}

/** Phone link (tel:) for the call button. Null when no phone is known or the venue is closed. */
export function callUrl(r: Restaurant): string | null {
  if (r.permanentlyClosed || !r.phone) return null;
  const digits = r.phone.replace(/[^+\d]/g, '');
  // shortcut: a valid Spanish number has 9 digits (plus country code); anything shorter is treated as unknown.
  return /\d{6,}/.test(digits) ? `tel:${digits}` : null;
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
