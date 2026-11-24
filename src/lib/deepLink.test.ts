import { describe, it, expect } from 'vitest';
import { restaurantLink, restaurantIdFromSearch } from './deepLink';

const BASE = 'https://kalt2212.github.io/joc-de-cartes-finder/';

describe('restaurantLink', () => {
  it('builds a shareable URL with the restaurant id', () => {
    expect(restaurantLink(BASE, 'casa-rafols')).toBe(`${BASE}?restaurant=casa-rafols`);
  });
  it('encodes an id with special characters', () => {
    expect(restaurantLink(BASE, 'a b')).toBe(`${BASE}?restaurant=a%20b`);
  });
});

describe('restaurantIdFromSearch', () => {
  it('reads the restaurant id from the query string', () => {
    expect(restaurantIdFromSearch('?restaurant=casa-rafols')).toBe('casa-rafols');
  });
  it('returns null when the parameter is absent or blank', () => {
    expect(restaurantIdFromSearch('')).toBeNull();
    expect(restaurantIdFromSearch('?restaurant=')).toBeNull();
    expect(restaurantIdFromSearch('?other=1')).toBeNull();
  });
});
