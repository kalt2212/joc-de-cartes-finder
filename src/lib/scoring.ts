export interface UserScore {
  menjar: number;
  servei: number;
  espai: number;
  cuina: number;
  preu: number;
  /** true when the user's star dish earns the bonus */
  platEstrella: boolean;
}

export type ScoresByRestaurant = Record<string, UserScore>;

export const PLAT_ESTRELLA_BONUS = 0.5;

const CRITERION_KEYS = ['menjar', 'servei', 'espai', 'cuina', 'preu'] as const;

export function isValidCriterion(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= 10;
}

/** Arithmetic mean of the five 0-10 criteria, plus the star-dish bonus, capped at 10 and rounded to one decimal. */
export function computeUserScore(score: UserScore): number {
  const values = [score.menjar, score.servei, score.espai, score.cuina, score.preu];
  if (!values.every(isValidCriterion)) {
    throw new RangeError('every criterion must be a finite number between 0 and 10');
  }
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const bonus = score.platEstrella ? PLAT_ESTRELLA_BONUS : 0;
  return Math.round(Math.min(10, mean + bonus) * 10) / 10;
}

/** Difference user minus official score, rounded to one decimal. Null when there is no official rating. */
export function compareWithOfficial(userScore: number, officialRating: number | null): number | null {
  if (officialRating === null) return null;
  return Math.round((userScore - officialRating) * 10) / 10;
}

export function buildShareText(name: string, userScore: number, officialRating: number | null): string {
  const official = officialRating === null ? 'sense nota oficial' : `nota oficial ${officialRating}/10`;
  return `Tu Joc de Cartes: ${name} - la meva nota ${userScore}/10 (${official}) #JocDeCartes`;
}

function isUserScore(value: unknown): value is UserScore {
  if (typeof value !== 'object' || value === null) return false;
  const s = value as Record<string, unknown>;
  return (
    CRITERION_KEYS.every((k) => typeof s[k] === 'number' && isValidCriterion(s[k] as number)) &&
    typeof s.platEstrella === 'boolean'
  );
}

/** Parses the localStorage payload. Anything malformed or invalid is dropped rather than thrown. */
export function parseStoredScores(raw: string | null): ScoresByRestaurant {
  if (raw === null) return {};
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return {};
  }
  if (typeof data !== 'object' || data === null || Array.isArray(data)) return {};
  const out: ScoresByRestaurant = {};
  for (const [id, value] of Object.entries(data as Record<string, unknown>)) {
    if (isUserScore(value)) out[id] = value;
  }
  return out;
}

export function serializeScores(scores: ScoresByRestaurant): string {
  return JSON.stringify(scores);
}

// ---- Share to X (Twitter Web Intent) and X handle persistence ----

export const SHARE_HASHTAG = '#JocDeCartes3Cat';
export const APP_URL = 'https://kalt2212.github.io/joc-de-cartes-finder/';
export const HANDLE_STORAGE_KEY = 'joc-de-cartes:x-handle';

/** Minimal Storage-like interface so persistence can be tested without a DOM. */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** Returns "@handle" for a valid X username (1-15 letters, digits or underscores), with or without a leading @; otherwise null. */
export function normalizeHandle(raw: string): string | null {
  const bare = raw.trim().replace(/^@+/, '');
  if (!/^[A-Za-z0-9_]{1,15}$/.test(bare)) return null;
  return `@${bare}`;
}

/** Reads the saved handle. Returns '' when nothing valid is stored. */
export function loadHandle(store: KeyValueStore | null): string {
  if (store === null) return '';
  try {
    const raw = store.getItem(HANDLE_STORAGE_KEY);
    return raw === null ? '' : (normalizeHandle(raw) ?? '');
  } catch {
    return '';
  }
}

/** Saves a valid handle, removes the saved one when the input is empty, and leaves storage untouched for invalid input. */
export function saveHandle(store: KeyValueStore | null, raw: string): void {
  if (store === null) return;
  try {
    if (raw.trim() === '') {
      store.removeItem(HANDLE_STORAGE_KEY);
      return;
    }
    const handle = normalizeHandle(raw);
    if (handle !== null) store.setItem(HANDLE_STORAGE_KEY, handle);
  } catch {
    // Storage may be full or disabled; sharing still works without persistence.
  }
}

export interface TweetInput {
  name: string;
  userScore: number;
  platEstrella: boolean;
  /** "@handle" of the user, or null when not provided */
  handle: string | null;
}

/** Builds the Catalan tweet body: restaurant, score out of 10, star-dish flag, optional mention, hashtag and app link. */
export function buildTweetText({ name, userScore, platEstrella, handle }: TweetInput): string {
  const star = platEstrella ? ' (amb plat estrella)' : '';
  const head = `Tu Joc de Cartes: ${name} - la meva nota ${userScore}/10${star}.`;
  const mention = handle ? ` Veredicte de ${handle}.` : '';
  return `${head}${mention} ${SHARE_HASHTAG} ${APP_URL}`;
}

/** X Web Intent URL with the text percent-encoded. */
export function buildTweetIntentUrl(text: string): string {
  return `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
}
