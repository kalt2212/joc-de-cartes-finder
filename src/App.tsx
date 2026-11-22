import { useMemo, useState } from 'react';
import data from '../public/data/restaurants.json';
import type { Restaurant } from './types';
import { sortByDistance, filterByComarca, mapsUrl } from './lib/geo';

const restaurants = data as Restaurant[];
const comarques = Array.from(new Set(restaurants.map((r) => r.comarca))).sort();

type Geo = { status: 'idle' | 'loading' | 'ok' | 'denied' | 'unsupported'; lat?: number; lng?: number };

export default function App() {
  const [comarca, setComarca] = useState('');
  const [geo, setGeo] = useState<Geo>({ status: 'idle' });

  const locate = () => {
    if (!('geolocation' in navigator)) return setGeo({ status: 'unsupported' });
    setGeo({ status: 'loading' });
    navigator.geolocation.getCurrentPosition(
      (p) => setGeo({ status: 'ok', lat: p.coords.latitude, lng: p.coords.longitude }),
      () => setGeo({ status: 'denied' }),
      { enableHighAccuracy: false, timeout: 10000 },
    );
  };

  const list = useMemo(() => {
    const filtered = filterByComarca(restaurants, comarca);
    if (geo.status === 'ok' && geo.lat !== undefined && geo.lng !== undefined) {
      return sortByDistance(filtered, { lat: geo.lat, lng: geo.lng });
    }
    return filtered;
  }, [comarca, geo]);

  return (
    <main className="mx-auto max-w-2xl p-4 sm:p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Joc de Cartes: restaurants</h1>
        <p className="text-sm text-stone-600">Restaurants del programa de TV3 per comarca o a prop teu.</p>
      </header>

      <section className="mb-6 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={locate}
          className="rounded-lg bg-stone-900 px-4 py-2 text-white hover:bg-stone-700"
        >
          {geo.status === 'loading' ? 'Localitzant…' : 'Restaurants a prop meu'}
        </button>
        <select
          value={comarca}
          onChange={(e) => setComarca(e.target.value)}
          className="rounded-lg border border-stone-300 bg-white px-3 py-2"
          aria-label="Comarca"
        >
          <option value="">Totes les comarques</option>
          {comarques.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </section>

      {geo.status === 'denied' && (
        <p className="mb-4 text-sm text-amber-700">No s'ha pogut obtenir la teva ubicació. Pots filtrar per comarca.</p>
      )}
      {geo.status === 'unsupported' && (
        <p className="mb-4 text-sm text-amber-700">El teu navegador no permet la geolocalització.</p>
      )}

      <ul className="space-y-4">
        {list.map((r) => (
          <li key={r.id} className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold">{r.name}</h2>
              {r.winner && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">Guanyador</span>}
              {r.sample && <span className="rounded-full bg-stone-200 px-2 py-0.5 text-xs text-stone-700">Exemple</span>}
            </div>
            <p className="text-sm text-stone-600">
              {r.city} · {r.comarca}
              {'distanceKm' in r && ` · ${(r as Restaurant & { distanceKm: number }).distanceKm.toFixed(1)} km`}
            </p>
            <p className="mt-1 text-sm">
              T{r.season}: {r.episodeTitle}
            </p>
            {r.platEstrella && (
              <p className="mt-1 text-sm">
                <span className="font-medium">Plat estrella:</span> {r.platEstrella}
              </p>
            )}
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-stone-700">{r.rating !== null ? `Nota: ${r.rating}/10` : 'Nota: pendent'}</span>
              <a
                href={r.googleMapsUrl || mapsUrl(r.name, r.city)}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-blue-700 underline"
              >
                Obrir a Google Maps
              </a>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
