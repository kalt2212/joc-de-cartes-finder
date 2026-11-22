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
