export interface UserScore {
  menjar: number;
  servei: number;
  espai: number;
  cuina: number;
  preu: number;
  /** true when the user's star dish earns the bonus */
  platEstrella: boolean;
}

export const PLAT_ESTRELLA_BONUS = 0.5;

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
