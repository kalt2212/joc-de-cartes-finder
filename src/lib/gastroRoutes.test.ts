import { describe, it, expect } from 'vitest';
import { GASTRO_ROUTES, routeRestaurants, routeStats } from './gastroRoutes';
import data from '../../public/data/restaurants.json';
import type { Restaurant } from '../types';

const restaurants = data as Restaurant[];

describe('GASTRO_ROUTES', () => {
  it('defines at least four curated routes with unique ids', () => {
    expect(GASTRO_ROUTES.length).toBeGreaterThanOrEqual(4);
    const ids = GASTRO_ROUTES.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every route has a title, a theme and at least three stops', () => {
    for (const r of GASTRO_ROUTES) {
      expect(r.title.trim()).not.toBe('');
      expect(r.theme.trim()).not.toBe('');
      expect(r.stopIds.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('references only restaurants that exist and are verified', () => {
    const byId = new Map(restaurants.map((r) => [r.id, r]));
    for (const route of GASTRO_ROUTES) {
      for (const id of route.stopIds) {
        const hit = byId.get(id);
        expect(hit, `${route.id} -> ${id}`).toBeDefined();
        expect(hit?.verified, `${route.id} -> ${id} must be verified`).toBe(true);
        expect(hit?.permanentlyClosed ?? false, `${route.id} -> ${id} must be open`).toBe(false);
      }
    }
  });

  it('has no duplicate stops within a route', () => {
    for (const r of GASTRO_ROUTES) {
      expect(new Set(r.stopIds).size).toBe(r.stopIds.length);
    }
  });
});

describe('routeRestaurants', () => {
  it('returns the restaurants of a route in stop order', () => {
    const route = GASTRO_ROUTES[0];
    const got = routeRestaurants(route, restaurants).map((r) => r.id);
    expect(got).toEqual(route.stopIds);
  });

  it('skips unknown ids instead of failing', () => {
    const route = { id: 'x', title: 'X', theme: 'X', stopIds: ['nope', restaurants[0].id] };
    expect(routeRestaurants(route, restaurants).map((r) => r.id)).toEqual([restaurants[0].id]);
  });
});

describe('routeStats', () => {
  it('reports the number of stops and the comarques covered', () => {
    const route = GASTRO_ROUTES[0];
    const s = routeStats(route, restaurants);
    expect(s.stops).toBe(route.stopIds.length);
    expect(s.comarques.length).toBeGreaterThan(0);
  });
});
