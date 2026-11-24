import type { Restaurant } from '../types';

/** Keeps only winners when the filter is on. Off returns the input unchanged. */
export function filterByWinner<T extends Restaurant>(items: readonly T[], onlyWinners: boolean): T[] {
  return onlyWinners ? items.filter((r) => r.winner) : [...items];
}

/** Keeps only restaurants with a display badge (e.g. Marc Ribas's own restaurant) when on. */
export function filterByBadge<T extends Restaurant>(items: readonly T[], onlyBadged: boolean): T[] {
  return onlyBadged ? items.filter((r) => r.badge !== undefined) : [...items];
}
