import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import data from '../public/data/restaurants.json';
import type { Restaurant } from './types';
import { sortByDistance, filterByComarca, mapsUrl } from './lib/geo';
import { searchRestaurants } from './lib/search';
import { findNearbyTargets, DEFAULT_RADIUS_KM } from './lib/radar';
import { parseStoredScores, serializeScores } from './lib/scoring';
import type { ScoresByRestaurant, UserScore } from './lib/scoring';
import { loadFavorites, toggleFavorite, filterFavorites } from './lib/favorites';
import { BTN_GHOST, BTN_ICON, BTN_MAP, BTN_PRIMARY, BTN_SECONDARY, BTN_ACTIVE, BTN_BASE } from './lib/buttonStyles';
import RadarBanner from './components/RadarBanner';

// Heavy panels are loaded on demand so the initial bundle only carries the list and radar views.
const RoutePlannerPanel = lazy(() => import('./components/RoutePlannerPanel'));
const ScoringModal = lazy(() => import('./components/ScoringModal'));

const restaurants = data as Restaurant[];
const comarques = Array.from(new Set(restaurants.map((r) => r.comarca))).sort();

const SCORES_STORAGE_KEY = 'joc_de_cartes_scores';

function readStoredScores(): ScoresByRestaurant {
  try {
    return parseStoredScores(window.localStorage.getItem(SCORES_STORAGE_KEY));
  } catch {
    return {};
  }
}

// Storage can be unavailable (private mode, denied access). Null makes the favorites helpers no-op safely.
function getStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

type Geo = { status: 'idle' | 'loading' | 'ok' | 'denied' | 'unsupported'; lat?: number; lng?: number };

function Icon({ d, className = 'h-4 w-4' }: { d: string | readonly string[]; className?: string }) {
  const paths: readonly string[] = typeof d === 'string' ? [d] : d;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths.map((p) => (
        <path key={p} d={p} />
      ))}
    </svg>
  );
}

const ICONS = {
  locate: ['M12 2v3', 'M12 19v3', 'M2 12h3', 'M19 12h3', 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z'],
  map: 'M9 18l-6 3V6l6-3 6 3 6-3v15l-6 3-6-3zM9 3v15M15 6v15',
  external: ['M15 3h6v6', 'M10 14L21 3', 'M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5'],
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  trophy: ['M8 21h8', 'M12 17v4', 'M7 4h10v5a5 5 0 0 1-10 0V4z', 'M17 5h3v2a3 3 0 0 1-3 3', 'M7 5H4v2a3 3 0 0 0 3 3'],
  search: ['M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z', 'M21 21l-4.35-4.35'],
  alert: ['M12 9v4', 'M12 17h.01', 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z'],
  utensils: ['M3 2v7a3 3 0 0 0 6 0V2', 'M6 2v20', 'M18 2c-2 1-3 4-3 8h3v12'],
  pin: ['M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z', 'M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'],
  x: 'M18 6L6 18M6 6l12 12',
} as const;

export default function App() {
  const [comarca, setComarca] = useState('');
  const [query, setQuery] = useState('');
  const [geo, setGeo] = useState<Geo>({ status: 'idle' });
  const [radarOn, setRadarOn] = useState(false);
  const [radiusKm, setRadiusKm] = useState(DEFAULT_RADIUS_KM);
  const [routeIds, setRouteIds] = useState<string[]>([]);
  const [scoring, setScoring] = useState<Restaurant | null>(null);
  const [scores, setScores] = useState<ScoresByRestaurant>(readStoredScores);
  const [favorites, setFavorites] = useState<string[]>(() => loadFavorites(getStorage()));
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(SCORES_STORAGE_KEY, serializeScores(scores));
    } catch {
      // Storage unavailable (private mode or quota): scores still last for this session.
    }
  }, [scores]);

  const saveScore = (id: string, score: UserScore) => setScores((prev) => ({ ...prev, [id]: score }));

  const toggleFav = (id: string) => setFavorites(toggleFavorite(getStorage(), id));

  // Radar needs a position while enabled. Watch it continuously so results follow the user; clear on disable or unmount.
  useEffect(() => {
    if (!radarOn) return;
    if (!('geolocation' in navigator)) {
      setGeo({ status: 'unsupported' });
      return;
    }
    setGeo((g) => (g.status === 'ok' ? g : { status: 'loading' }));
    const watchId = navigator.geolocation.watchPosition(
      (p) => setGeo({ status: 'ok', lat: p.coords.latitude, lng: p.coords.longitude }),
      () => setGeo({ status: 'denied' }),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [radarOn]);

  const locate = () => {
    if (!('geolocation' in navigator)) return setGeo({ status: 'unsupported' });
    setGeo({ status: 'loading' });
    navigator.geolocation.getCurrentPosition(
      (p) => setGeo({ status: 'ok', lat: p.coords.latitude, lng: p.coords.longitude }),
      () => setGeo({ status: 'denied' }),
      { enableHighAccuracy: false, timeout: 10000 },
    );
  };

  const userPoint = geo.status === 'ok' && geo.lat !== undefined && geo.lng !== undefined ? { lat: geo.lat, lng: geo.lng } : null;

  const list = useMemo(() => {
    const byText = query.trim() === '' ? restaurants : searchRestaurants(restaurants, query).map((h) => h.restaurant);
    const filtered = filterByComarca(byText, comarca);
    const shown = onlyFavorites ? filterFavorites(filtered, favorites) : filtered;
    if (userPoint !== null) {
      return sortByDistance(shown, userPoint);
    }
    return shown;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comarca, query, geo, onlyFavorites, favorites]);

  const radarHits = useMemo(
    () => (radarOn && userPoint !== null ? findNearbyTargets(restaurants, userPoint, radiusKm) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [radarOn, radiusKm, geo],
  );

  const routeStops = routeIds
    .map((id) => restaurants.find((r) => r.id === id))
    .filter((r): r is Restaurant => r !== undefined);

  const toggleRoute = (id: string) =>
    setRouteIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  const nearby = geo.status === 'ok';

  return (
    <div className="min-h-screen bg-stone-50 pb-10 text-stone-900">
      <header className="sticky top-0 z-20 border-b border-stone-200/70 bg-white/75 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-stone-900 text-amber-300 shadow-sm">
              <Icon d={ICONS.utensils} className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold leading-tight sm:text-lg">Joc de Cartes</h1>
              <p className="truncate text-xs text-stone-500">{restaurants.length} restaurants del programa</p>
            </div>
          </div>
          <button
            type="button"
            onClick={locate}
            disabled={geo.status === 'loading'}
            aria-label="Restaurants a prop meu"
            className={`${BTN_PRIMARY} shrink-0`}
          >
            <Icon d={ICONS.locate} />
            <span className="hidden sm:inline">{geo.status === 'loading' ? 'Localitzant…' : 'Restaurants a prop meu'}</span>
            <span className="sm:hidden">{geo.status === 'loading' ? '…' : 'A prop'}</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">
        <section className="mb-6 rounded-2xl border border-stone-200 bg-white p-3 shadow-sm sm:p-4">
          <label className="relative block">
            <span className="sr-only">Cercar al veredicte</span>
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-stone-400">
              <Icon d={ICONS.search} />
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="El Veredicte de Marc Ribas: cerca per nom, poble, plat..."
              className="w-full rounded-xl border border-stone-300 bg-stone-50 py-2.5 pl-10 pr-3 text-sm transition focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </label>

          <label className="relative mt-3 block">
            <span className="sr-only">Filtrar per comarca</span>
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-stone-400">
              <Icon d={ICONS.pin} />
            </span>
            <select
              value={comarca}
              onChange={(e) => setComarca(e.target.value)}
              className="w-full cursor-pointer appearance-none rounded-xl border border-stone-300 bg-stone-50 py-2.5 pl-10 pr-10 text-sm transition hover:border-stone-400 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-200"
              aria-label="Comarca"
            >
              <option value="">Totes les comarques</option>
              {comarques.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-stone-400">
              <Icon d="M6 9l6 6 6-6" />
            </span>
          </label>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-stone-500">
            <span>
              {list.length} {list.length === 1 ? 'resultat' : 'resultats'}
            </span>
            {nearby && <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">Ordenats per distància</span>}
            <button
              type="button"
              onClick={() => setOnlyFavorites((on) => !on)}
              aria-pressed={onlyFavorites}
              className={onlyFavorites ? BTN_ACTIVE : BTN_GHOST}
            >
              <Icon d={ICONS.star} className="h-3.5 w-3.5" />
              Només preferits
            </button>
            {comarca && (
              <button
                type="button"
                onClick={() => setComarca('')}
                aria-label={`Treu el filtre de comarca ${comarca}`}
                className={`${BTN_BASE} gap-1 rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-700 hover:bg-stone-200 hover:text-stone-900`}
              >
                {comarca}
                <Icon d={ICONS.x} className="h-3 w-3" />
              </button>
            )}
          </div>
        </section>

        <RadarBanner
          enabled={radarOn}
          hits={radarHits}
          radiusKm={radiusKm}
          onRadiusChange={setRadiusKm}
          onToggle={() => setRadarOn((on) => !on)}
        />

        <Suspense fallback={null}>
          <RoutePlannerPanel
            origin={userPoint}
            stops={routeStops}
            onRemove={(id) => setRouteIds((ids) => ids.filter((x) => x !== id))}
            onClear={() => setRouteIds([])}
          />
        </Suspense>

        {geo.status === 'denied' && (
          <p className="mb-4 flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <Icon d={ICONS.alert} /> No s'ha pogut obtenir la teva ubicació. Pots filtrar per comarca.
          </p>
        )}
        {geo.status === 'unsupported' && (
          <p className="mb-4 flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <Icon d={ICONS.alert} /> El teu navegador no permet la geolocalització.
          </p>
        )}

        {list.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-12 text-center">
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-400">
              <Icon d={ICONS.search} className="h-6 w-6" />
            </span>
            <p className="font-medium text-stone-800">No hi ha restaurants per a aquesta cerca</p>
            <p className="mt-1 text-sm text-stone-500">Prova amb una altra paraula o comarca.</p>
            <button
              type="button"
              onClick={() => {
                setComarca('');
                setQuery('');
                setOnlyFavorites(false);
              }}
              className={`${BTN_SECONDARY} mt-4`}
            >
              Mostra tots els restaurants
            </button>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {list.map((r) => {
              const inRoute = routeIds.includes(r.id);
              const isFav = favorites.includes(r.id);
              return (
                <li
                  key={r.id}
                  className={`group flex flex-col rounded-2xl border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                    r.winner ? 'border-amber-200' : 'border-stone-200'
                  }`}
                >
                  <div className="flex flex-wrap gap-1.5">
                    {r.winner && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                        <Icon d={ICONS.trophy} className="h-3 w-3" /> Guanyador
                      </span>
                    )}
                    {r.badge && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-800">
                        <Icon d={ICONS.star} className="h-3 w-3" /> {r.badge}
                      </span>
                    )}
                    {r.permanentlyClosed && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
                        <Icon d={ICONS.x} className="h-3 w-3" /> Tancat definitivament
                      </span>
                    )}
                  </div>

                  <h2 className="mt-2 text-lg font-semibold leading-snug text-stone-900">{r.name}</h2>
                  <p className="mt-0.5 flex items-center gap-1 text-sm text-stone-500">
                    <Icon d={ICONS.pin} className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      {r.city} · {r.comarca}
                      {'distanceKm' in r && (
                        <span className="font-medium text-emerald-700">
                          {' '}
                          · {(r as Restaurant & { distanceKm: number }).distanceKm.toFixed(1)} km
                        </span>
                      )}
                    </span>
                  </p>

                  <div className="mt-3 rounded-xl bg-stone-50 px-3 py-2.5 text-sm">
                    <p className="font-medium text-stone-800">
                      {r.season !== null ? `T${r.season}: ` : ''}
                      {r.episodeTitle}
                    </p>
                    {r.platEstrella && (
                      <p className="mt-1.5 text-stone-700">
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-700">
                          <Icon d={ICONS.star} className="h-3.5 w-3.5" /> Plat estrella
                        </span>
                        <span className="block">{r.platEstrella}</span>
                      </p>
                    )}
                  </div>

                  <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4">
                    <span className={`text-sm font-semibold ${r.rating !== null ? 'text-stone-800' : 'text-stone-400'}`}>
                      {r.rating !== null ? `★ ${r.rating}/10` : 'Nota pendent'}
                    </span>
                    <div className="flex flex-wrap items-center gap-1">
                      <button
                        type="button"
                        onClick={() => toggleFav(r.id)}
                        aria-pressed={isFav}
                        className={isFav ? BTN_ACTIVE : BTN_GHOST}
                      >
                        <Icon d={ICONS.star} className="h-3.5 w-3.5" />
                        {isFav ? 'Preferit' : 'Desa'}
                      </button>
                      <button type="button" onClick={() => setScoring(r)} className={BTN_GHOST}>
                        La meva nota
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleRoute(r.id)}
                        aria-pressed={inRoute}
                        className={inRoute ? BTN_ACTIVE : BTN_GHOST}
                      >
                        {inRoute ? 'A la ruta' : 'Afegeix a la ruta'}
                      </button>
                      {r.sourceUrl && (
                        <a href={r.sourceUrl} target="_blank" rel="noreferrer" className={BTN_GHOST}>
                          Font
                        </a>
                      )}
                      <a
                        href={r.googleMapsUrl || mapsUrl(r.name, r.city)}
                        target="_blank"
                        rel="noreferrer"
                        className={BTN_MAP}
                      >
                        <Icon d={ICONS.map} className="h-3.5 w-3.5" />
                        Mapa
                        <Icon d={ICONS.external} className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      {scoring !== null && (
        <Suspense fallback={null}>
          <ScoringModal
            restaurant={scoring}
            initialScores={scores[scoring.id]}
            onSave={(s) => saveScore(scoring.id, s)}
            onClose={() => setScoring(null)}
          />
        </Suspense>
      )}
    </div>
  );
}
