import type { Restaurant } from '../types';

/** Support link from the build-time VITE_SUPPORT_URL. Only https links are accepted; empty means none. */
export function supportUrl(raw: string | undefined): string | null {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    return u.protocol === 'https:' ? u.toString() : null;
  } catch {
    return null;
  }
}

/** True only when the record explicitly marks the venue as sponsored. */
export function isSponsored(r: Restaurant): boolean {
  return r.sponsored === true;
}

/** Sponsored venues first, the rest keep their order. Returns a new array. */
export function sponsoredFirst(list: readonly Restaurant[]): Restaurant[] {
  const sponsored = list.filter(isSponsored);
  const rest = list.filter((r) => !isSponsored(r));
  return [...sponsored, ...rest];
}
