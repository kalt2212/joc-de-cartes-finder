/** Shareable link to one restaurant: the app URL plus ?restaurant=<id>. */
export function restaurantLink(baseUrl: string, id: string): string {
  return `${baseUrl}?restaurant=${encodeURIComponent(id)}`;
}

/** Reads the restaurant id from a query string. Null when missing or blank. */
export function restaurantIdFromSearch(search: string): string | null {
  const id = new URLSearchParams(search).get('restaurant');
  return id && id.trim() !== '' ? id : null;
}
