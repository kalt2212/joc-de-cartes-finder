import { describe, it, expect } from 'vitest';
import {
  normalizeHandle,
  loadHandle,
  saveHandle,
  buildTweetText,
  buildTweetIntentUrl,
  HANDLE_STORAGE_KEY,
  APP_URL,
  SHARE_HASHTAG,
  type KeyValueStore,
} from './scoring';

function memoryStore(): KeyValueStore & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => (data.has(k) ? (data.get(k) as string) : null),
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

describe('normalizeHandle', () => {
  it('adds a leading @ and trims whitespace', () => {
    expect(normalizeHandle('  kalt_22 ')).toBe('@kalt_22');
    expect(normalizeHandle('@kalt_22')).toBe('@kalt_22');
  });
  it('accepts up to 15 characters', () => {
    expect(normalizeHandle('a'.repeat(15))).toBe(`@${'a'.repeat(15)}`);
  });
  it('rejects empty, too long, or invalid characters', () => {
    expect(normalizeHandle('')).toBeNull();
    expect(normalizeHandle('@')).toBeNull();
    expect(normalizeHandle('a'.repeat(16))).toBeNull();
    expect(normalizeHandle('nom con espais')).toBeNull();
    expect(normalizeHandle('bad-handle')).toBeNull();
  });
});

describe('handle persistence', () => {
  it('saves a valid handle under the storage key and loads it back', () => {
    const store = memoryStore();
    saveHandle(store, 'kalt_22');
    expect(store.data.get(HANDLE_STORAGE_KEY)).toBe('@kalt_22');
    expect(loadHandle(store)).toBe('@kalt_22');
  });
  it('ignores invalid input and keeps the previous value', () => {
    const store = memoryStore();
    saveHandle(store, '@ok_user');
    saveHandle(store, 'no valid!');
    expect(loadHandle(store)).toBe('@ok_user');
  });
  it('removes the stored handle when the input is cleared', () => {
    const store = memoryStore();
    saveHandle(store, '@ok_user');
    saveHandle(store, '   ');
    expect(store.data.has(HANDLE_STORAGE_KEY)).toBe(false);
    expect(loadHandle(store)).toBe('');
  });
  it('returns an empty handle for corrupted or missing storage', () => {
    const store = memoryStore();
    store.setItem(HANDLE_STORAGE_KEY, '{"bad": true}');
    expect(loadHandle(store)).toBe('');
    expect(loadHandle(null)).toBe('');
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
    expect(loadHandle(broken)).toBe('');
    expect(() => saveHandle(broken, '@x')).not.toThrow();
  });
});

describe('buildTweetText', () => {
  it('includes name, score out of 10, hashtag and app link', () => {
    const text = buildTweetText({ name: 'La Taverna', userScore: 7.5, platEstrella: false, handle: null });
    expect(text).toContain('La Taverna');
    expect(text).toContain('7.5/10');
    expect(text).not.toContain('plat estrella');
    expect(text).toContain(SHARE_HASHTAG);
    expect(text.endsWith(APP_URL)).toBe(true);
  });
  it('mentions the star dish when it was eaten', () => {
    const text = buildTweetText({ name: 'X', userScore: 8, platEstrella: true, handle: null });
    expect(text).toContain('(amb plat estrella)');
  });
  it('mentions the user handle when provided', () => {
    const text = buildTweetText({ name: 'X', userScore: 8, platEstrella: false, handle: '@kalt_22' });
    expect(text).toContain('@kalt_22');
  });
  it('keeps the exact expected format', () => {
    const text = buildTweetText({ name: 'Fonda', userScore: 6, platEstrella: true, handle: '@me' });
    expect(text).toBe(
      `Tu Joc de Cartes: Fonda - la meva nota 6/10 (amb plat estrella). Veredicte de @me. ${SHARE_HASHTAG} ${APP_URL}`,
    );
  });
});

describe('buildTweetIntentUrl', () => {
  it('points to the X intent endpoint with an encoded text parameter', () => {
    const text = buildTweetText({ name: 'Bar & Cafè', userScore: 7, platEstrella: false, handle: '@me' });
    const url = new URL(buildTweetIntentUrl(text));
    expect(url.origin + url.pathname).toBe('https://x.com/intent/tweet');
    expect(url.searchParams.get('text')).toBe(text);
  });
});
