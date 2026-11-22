import { distanceKm } from './geo';

export interface Point {
  lat: number;
  lng: number;
}

export interface RoutePlan<T extends Point> {
  stops: T[];
  totalKm: number;
  driveMinutes: number;
}

export const DEFAULT_SPEED_KMH = 60;

const EPS = 1e-9;

/** Total great-circle length in km of the polyline through the given points, in order. */
export function pathLengthKm(points: readonly Point[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += distanceKm(points[i - 1], points[i]);
  }
  return total;
}

/** Greedy nearest-neighbour visiting order over indices. Index 0 (the origin) stays first. */
function nearestNeighbourOrder(points: readonly Point[]): number[] {
  const left = points.map((_, i) => i).slice(1);
  const order = [0];
  while (left.length > 0) {
    const current = points[order[order.length - 1]];
    let bestPos = 0;
    for (let p = 1; p < left.length; p++) {
      if (distanceKm(current, points[left[p]]) < distanceKm(current, points[left[bestPos]])) {
        bestPos = p;
      }
    }
    order.push(left.splice(bestPos, 1)[0]);
  }
  return order;
}

/** 2-opt local search on an open path. Position 0 is fixed; segments are reversed while that shortens the path. */
function twoOptOrder(points: readonly Point[], start: readonly number[]): number[] {
  const tour = [...start];
  const n = tour.length;
  const d = (a: number, b: number): number => distanceKm(points[a], points[b]);
  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 1; i < n - 1; i++) {
      for (let j = i + 1; j < n; j++) {
        const hasNext = j + 1 < n;
        const before = d(tour[i - 1], tour[i]) + (hasNext ? d(tour[j], tour[j + 1]) : 0);
        const after = d(tour[i - 1], tour[j]) + (hasNext ? d(tour[i], tour[j + 1]) : 0);
        if (after < before - EPS) {
          reverseSegment(tour, i, j);
          improved = true;
        }
      }
    }
  }
  return tour;
}

function reverseSegment(arr: number[], from: number, to: number): void {
  let a = from;
  let b = to;
  while (a < b) {
    const tmp = arr[a];
    arr[a] = arr[b];
    arr[b] = tmp;
    a++;
    b--;
  }
}

/**
 * Plans a day-trip route from an origin through the selected stops.
 * Uses nearest-neighbour as the starting tour, then 2-opt to remove crossings.
 * The route is open (no return to origin) and the origin is never reordered.
 */
export function planRoute<T extends Point>(
  origin: Point,
  stops: readonly T[],
  speedKmh: number = DEFAULT_SPEED_KMH,
): RoutePlan<T> {
  if (!Number.isFinite(speedKmh) || speedKmh <= 0) {
    throw new RangeError('speedKmh must be a positive finite number');
  }
  if (stops.length === 0) {
    return { stops: [], totalKm: 0, driveMinutes: 0 };
  }
  const points: Point[] = [origin, ...stops];
  const order = twoOptOrder(points, nearestNeighbourOrder(points));
  const ordered = order.slice(1).map((idx) => stops[idx - 1]);
  const totalKm = pathLengthKm([origin, ...ordered]);
  return {
    stops: ordered,
    totalKm,
    driveMinutes: Math.round((totalKm / speedKmh) * 60),
  };
}

/** Exported for tests: a single 2-opt pass set over an explicit starting order. */
export function improveOrder(points: readonly Point[], startOrder: readonly number[]): number[] {
  return twoOptOrder(points, startOrder);
}
