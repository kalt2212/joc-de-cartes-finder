export interface Restaurant {
  id: string;
  name: string;
  comarca: string;
  city: string;
  lat: number;
  lng: number;
  /** null when the season number was not verified */
  season: number | null;
  episodeTitle: string;
  winner: boolean;
  platEstrella: string | null;
  rating: number | null;
  /** true only when the record was checked against a primary source */
  verified: boolean;
  /** true when Google Maps reports the business as permanently closed */
  permanentlyClosed?: boolean;
  /** optional display badge, e.g. the host's own restaurant */
  badge?: string;
  /** optional free-text note about provenance or accuracy */
  note?: string;
  /** Marc Ribas's own score (0-10), only set when verified from a reputable source */
  marcScore?: number | null;
  /** URL of the article that verifies marcScore */
  marcScoreSource?: string | null;
  /** true only when marcScore was checked against a reputable source */
  marcScoreVerified?: boolean;
  /** Final episode score (0-10) from the broadcast recap, null when unknown */
  episodeFinalScore?: number | null;
  /** URL of the article that verifies episodeFinalScore */
  episodeScoreSource?: string | null;
  sourceUrl?: string;
  googleMapsUrl: string;
}
