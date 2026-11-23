import type { KeyValueStore } from './scoring';

export const FAVORITES_STORAGE_KEY = 'joc-de-cartes:favorites';

/**
 * Loads the saved favorite restaurant ids. Returns [] for missing, corrupt,
 * or unreadable storage so the app never throws on bad local data.
 * Non-string entries and duplicates are dropped.
 */
export function loadFavorites(store: KeyValueStore | null): string[] {
  if (!store) return [];
  try {
    const raw = store.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return [...new Set(parsed.filter((v): v is string => typeof v === 'string'))];
  } catch {
    return [];
  }
}

/** Adds the id when absent, removes it when present, persists, and returns the new list. */
export function toggleFavorite(store: KeyValueStore | null, id: string): string[] {
  const current = loadFavorites(store);
  const next = current.includes(id) ? current.filter((f) => f !== id) : [...current, id];
  try {
    store?.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage full or denied: the in-memory result is still returned.
  }
  return next;
}

export function isFavorite(favorites: readonly string[], id: string): boolean {
  return favorites.includes(id);
}

/** Keeps only the items whose id is saved as a favorite, preserving input order. */
export function filterFavorites<T extends { id: string }>(items: readonly T[], favorites: readonly string[]): T[] {
  return items.filter((item) => favorites.includes(item.id));
}
