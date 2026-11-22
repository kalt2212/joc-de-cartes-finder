export interface Restaurant {
  id: string;
  name: string;
  comarca: string;
  city: string;
  lat: number;
  lng: number;
  season: number;
  episodeTitle: string;
  winner: boolean;
  platEstrella: string | null;
  rating: number | null;
  /** true only when the record has been checked against a primary source */
  verified: boolean;
  sample?: boolean;
  googleMapsUrl: string;
}
