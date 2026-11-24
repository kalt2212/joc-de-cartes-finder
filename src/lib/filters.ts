import type { Restaurant } from '../types';

/** Keeps only winners when the filter is on. Off returns the input unchanged. */
export function filterByWinner<T extends Restaurant>(items: readonly T[], onlyWinners: boolean): T[] {
  return onlyWinners ? items.filter((r) => r.winner) : [...items];
}

/** Keeps only restaurants with a display badge (e.g. Marc Ribas's own restaurant) when on. */
export function filterByBadge<T extends Restaurant>(items: readonly T[], onlyBadged: boolean): T[] {
  return onlyBadged ? items.filter((r) => r.badge !== undefined) : [...items];
}

/** Keeps only restaurants from the given season. A null season returns the input unchanged. */
export function filterBySeason<T extends Restaurant>(items: readonly T[], season: number | null): T[] {
  return season === null ? [...items] : items.filter((r) => r.season === season);
}

/** Sorts by episode final score, highest first. Unknown scores go last. Does not mutate the input. */
export function sortByScore<T extends Restaurant>(items: readonly T[]): T[] {
  return [...items].sort((x, y) => {
    const a = x.episodeFinalScore ?? -Infinity;
    const b = y.episodeFinalScore ?? -Infinity;
    return b - a;
  });
}
