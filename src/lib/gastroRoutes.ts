import type { Restaurant } from '../types';

export interface GastroRoute {
  id: string;
  title: string;
  theme: string;
  /** Restaurant ids in visiting order. Each must exist and be verified and open. */
  stopIds: string[];
}

/** Curated weekend routes built from verified restaurants that have a known place in the dataset. */
export const GASTRO_ROUTES: GastroRoute[] = [
  {
    id: 'ruta-costa-brava-sud',
    title: 'Ruta Costa Brava Sud',
    theme: 'Mar i arròs',
    stopIds: ['b2-pura-brasa', 'b2-tasketa-del-mar', 'b2-italianini', 't8xc5-tres-margarit', 'l-arbre-de-juliette'],
  },
  {
    id: 'ruta-garrotxa-volcanica',
    title: 'Ruta Garrotxa volcànica',
    theme: 'Cuina de muntanya',
    stopIds: ['b2-hivernacle-olot', 'b2-la-deu', 't8xc12-cal-ganso'],
  },
  {
    id: 'ruta-tapes-bcn',
    title: 'Ruta Tapes BCN',
    theme: 'Barri i tapes',
    stopIds: ['t9xc19-gaig', 't9xc19-jiribilla', 't9xc19-nobu'],
  },
  {
    id: 'ruta-maresme-mar',
    title: 'Ruta Maresme',
    theme: 'Platja i terrassa',
    stopIds: ['b2-ambient', 'b2-bar-martinez', 'b2-cobalto', 't9xc14-nova-cisa'],
  },
];

/** The restaurants of a route, in stop order. Unknown ids are skipped, never fatal. */
export function routeRestaurants(route: GastroRoute, all: readonly Restaurant[]): Restaurant[] {
  const byId = new Map(all.map((r) => [r.id, r]));
  return route.stopIds.flatMap((id) => {
    const hit = byId.get(id);
    return hit ? [hit] : [];
  });
}

export interface RouteStats {
  stops: number;
  comarques: string[];
}

/** Stop count and the distinct comarques a route passes through. */
export function routeStats(route: GastroRoute, all: readonly Restaurant[]): RouteStats {
  const stops = routeRestaurants(route, all);
  const comarques = [...new Set(stops.map((r) => r.comarca))];
  return { stops: stops.length, comarques };
}
