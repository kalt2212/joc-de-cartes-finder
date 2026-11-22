import type { Restaurant } from '../types';

export interface SearchHit {
  restaurant: Restaurant;
  score: number;
}

/** Field weights: a match in the name counts more than a match in a note. */
const FIELD_WEIGHTS: ReadonlyArray<readonly [keyof Restaurant, number]> = [
  ['name', 3],
  ['platEstrella', 2.5],
  ['city', 2],
  ['comarca', 2],
  ['episodeTitle', 1.5],
  ['badge', 1.5],
  ['note', 1],
];

/** Lowercase, strip diacritics (ç, è, à...), collapse punctuation into spaces. */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function tokenize(text: string): string[] {
  const n = normalize(text);
  return n === '' ? [] : n.split(' ');
}

/** Levenshtein edit distance, two-row dynamic programming. */
export function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const curr: number[] = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    prev = curr;
  }
  return prev[b.length];
}

/** Score one query token against one field token: exact 1, prefix 0.8, typo-tolerant 0.5 for words of 5+ letters. */
function tokenScore(queryTok: string, fieldToks: readonly string[]): number {
  let best = 0;
  for (const ft of fieldToks) {
    if (ft === queryTok) return 1;
    if (ft.startsWith(queryTok)) best = Math.max(best, 0.8);
    else if (queryTok.length >= 5 && editDistance(queryTok, ft) <= 1) best = Math.max(best, 0.5);
  }
  return best;
}

/**
 * Multi-field tokenized fuzzy search over the program's restaurant records.
 * Every query token must match at least one field, otherwise the record is dropped.
 */
export function searchRestaurants(items: readonly Restaurant[], query: string): SearchHit[] {
  const queryToks = tokenize(query);
  if (queryToks.length === 0) return [];
  const hits: SearchHit[] = [];
  for (const restaurant of items) {
    let total = 0;
    let allMatched = true;
    for (const qt of queryToks) {
      let bestForToken = 0;
      for (const [field, weight] of FIELD_WEIGHTS) {
        const value = restaurant[field];
        if (typeof value !== 'string') continue;
        const s = tokenScore(qt, tokenize(value)) * weight;
        if (s > bestForToken) bestForToken = s;
      }
      if (bestForToken === 0) {
        allMatched = false;
        break;
      }
      total += bestForToken;
    }
    if (allMatched) hits.push({ restaurant, score: total });
  }
  return hits.sort((x, y) => y.score - x.score);
}
