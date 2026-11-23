import { describe, it, expect } from 'vitest';
import {
  loadFavorites,
  toggleFavorite,
  isFavorite,
  FAVORITES_STORAGE_KEY,
} from './favorites';
import type { KeyValueStore } from './scoring';

function memoryStore(): KeyValueStore & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => (data.has(k) ? (data.get(k) as string) : null),
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

describe('loadFavorites', () => {
  it('returns an empty list when storage is empty or missing', () => {
    expect(loadFavorites(memoryStore())).toEqual([]);
    expect(loadFavorites(null)).toEqual([]);
  });

  it('returns an empty list for corrupt JSON without throwing', () => {
    const store = memoryStore();
    store.setItem(FAVORITES_STORAGE_KEY, '{not json');
    expect(() => loadFavorites(store)).not.toThrow();
    expect(loadFavorites(store)).toEqual([]);
  });

  it('returns an empty list when the stored value is not an array', () => {
    const store = memoryStore();
    store.setItem(FAVORITES_STORAGE_KEY, '{"bad": true}');
    expect(loadFavorites(store)).toEqual([]);
  });

  it('drops non-string entries and duplicates from valid storage', () => {
    const store = memoryStore();
    store.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(['a', 3, null, 'a', 'b']));
    expect(loadFavorites(store)).toEqual(['a', 'b']);
  });

  it('survives storage that throws', () => {
    const broken: KeyValueStore = {
      getItem: () => {
        throw new Error('denied');
      },
      setItem: () => {
        throw new Error('quota');
      },
      removeItem: () => {
        throw new Error('denied');
      },
    };
    expect(loadFavorites(broken)).toEqual([]);
  });
});

describe('toggleFavorite', () => {
  it('adds a restaurant id when absent and persists it', () => {
    const store = memoryStore();
    const result = toggleFavorite(store, 'la-taverna');
    expect(result).toEqual(['la-taverna']);
    expect(loadFavorites(store)).toEqual(['la-taverna']);
  });

  it('removes the restaurant id when already present', () => {
    const store = memoryStore();
    toggleFavorite(store, 'la-taverna');
    toggleFavorite(store, 'fonda');
    const result = toggleFavorite(store, 'la-taverna');
    expect(result).toEqual(['fonda']);
    expect(loadFavorites(store)).toEqual(['fonda']);
  });

  it('replaces corrupt stored data with a valid list on the next toggle', () => {
    const store = memoryStore();
    store.setItem(FAVORITES_STORAGE_KEY, '{broken');
    expect(toggleFavorite(store, 'x')).toEqual(['x']);
    expect(loadFavorites(store)).toEqual(['x']);
  });
});

describe('isFavorite', () => {
  it('reports membership in the favorites list', () => {
    expect(isFavorite(['a', 'b'], 'a')).toBe(true);
    expect(isFavorite(['a', 'b'], 'c')).toBe(false);
    expect(isFavorite([], 'a')).toBe(false);
  });
});
