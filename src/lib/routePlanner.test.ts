import { describe, it, expect } from 'vitest';
import { planRoute, pathLengthKm, improveOrder, type Point } from './routePlanner';

interface Stop extends Point {
  id: string;
}

const origin: Point = { lat: 0, lng: 0 };

describe('pathLengthKm', () => {
  it('returns 0 for fewer than two points', () => {
    expect(pathLengthKm([])).toBe(0);
    expect(pathLengthKm([origin])).toBe(0);
  });
  it('sums consecutive legs', () => {
    const pts: Point[] = [origin, { lat: 0, lng: 1 }, { lat: 0, lng: 2 }];
    expect(pathLengthKm(pts)).toBeCloseTo(222.4, 0);
  });
});

describe('improveOrder (2-opt)', () => {
  it('removes a crossing in a square tour', () => {
    // p0 origin, p1 and p2 diagonal crossing, p3 opposite corner
    const pts: Point[] = [
      { lat: 0, lng: 0 },
      { lat: 1, lng: 1 },
      { lat: 0, lng: 1 },
      { lat: 1, lng: 0 },
    ];
    const crossed = [0, 1, 2, 3];
    const fixed = improveOrder(pts, crossed);
    expect(fixed).toEqual([0, 2, 1, 3]);
    expect(pathLengthKm(fixed.map((i) => pts[i]))).toBeLessThan(pathLengthKm(crossed.map((i) => pts[i])));
  });
  it('keeps the origin in position 0', () => {
    const pts: Point[] = [origin, { lat: 0, lng: 3 }, { lat: 0, lng: 1 }, { lat: 0, lng: 2 }];
    expect(improveOrder(pts, [0, 1, 2, 3])[0]).toBe(0);
  });
  it('leaves an already optimal order unchanged', () => {
    const pts: Point[] = [origin, { lat: 0, lng: 1 }, { lat: 0, lng: 2 }, { lat: 0, lng: 3 }];
    expect(improveOrder(pts, [0, 1, 2, 3])).toEqual([0, 1, 2, 3]);
  });
});

describe('planRoute', () => {
  it('returns an empty plan when no stops are selected', () => {
    expect(planRoute(origin, [])).toEqual({ stops: [], totalKm: 0, driveMinutes: 0 });
  });
  it('handles a single stop', () => {
    const stop: Stop = { id: 'a', lat: 0, lng: 1 };
    const plan = planRoute(origin, [stop]);
    expect(plan.stops.map((s) => s.id)).toEqual(['a']);
    expect(plan.totalKm).toBeCloseTo(111.2, 0);
  });
  it('orders collinear stops from nearest to farthest', () => {
    const stops: Stop[] = [
      { id: 'far', lat: 0, lng: 3 },
      { id: 'near', lat: 0, lng: 1 },
      { id: 'mid', lat: 0, lng: 2 },
    ];
    const plan = planRoute(origin, stops);
    expect(plan.stops.map((s) => s.id)).toEqual(['near', 'mid', 'far']);
    expect(plan.totalKm).toBeCloseTo(333.6, 0);
  });
  it('never produces a longer route than plain nearest-neighbour order', () => {
    const stops: Stop[] = [
      { id: 'a', lat: 41.4, lng: 2.2 },
      { id: 'b', lat: 41.2, lng: 1.6 },
      { id: 'c', lat: 41.9, lng: 1.7 },
      { id: 'd', lat: 41.5, lng: 1.9 },
      { id: 'e', lat: 42.0, lng: 1.5 },
    ];
    const plan = planRoute(origin, stops);
    expect(plan.stops).toHaveLength(stops.length);
    expect(new Set(plan.stops.map((s) => s.id))).toEqual(new Set(stops.map((s) => s.id)));
    const naive = pathLengthKm([origin, ...stops]);
    expect(plan.totalKm).toBeLessThanOrEqual(naive + 1e-9);
  });
  it('computes drive minutes from the average speed', () => {
    const stop: Stop = { id: 'a', lat: 0, lng: 1 };
    const plan = planRoute(origin, [stop], 60);
    expect(plan.driveMinutes).toBe(Math.round((plan.totalKm / 60) * 60));
  });
  it('rejects a non-positive or non-finite speed', () => {
    const stop: Stop = { id: 'a', lat: 0, lng: 1 };
    expect(() => planRoute(origin, [stop], 0)).toThrow(RangeError);
    expect(() => planRoute(origin, [stop], -5)).toThrow(RangeError);
    expect(() => planRoute(origin, [stop], Number.NaN)).toThrow(RangeError);
  });
});
