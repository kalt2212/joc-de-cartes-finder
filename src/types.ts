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
  sourceUrl?: string;
  googleMapsUrl: string;
}
