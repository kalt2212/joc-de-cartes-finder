import { useMemo } from 'react';
import type { Restaurant } from '../types';
import { planRoute, type Point } from '../lib/routePlanner';
import { mapsUrl } from '../lib/geo';

interface RoutePlannerPanelProps {
  origin: Point | null;
  stops: Restaurant[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

export default function RoutePlannerPanel({ origin, stops, onRemove, onClear }: RoutePlannerPanelProps) {
  const plan = useMemo(() => (origin !== null && stops.length > 0 ? planRoute(origin, stops) : null), [origin, stops]);

  return (
    <section className="mb-6 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-stone-900">Ruta Joc de Cartes</h2>
        {stops.length > 0 && (
          <button type="button" onClick={onClear} className="text-sm text-stone-600 hover:text-stone-900">
            Buida la ruta
          </button>
        )}
      </div>

      {origin === null || stops.length === 0 ? (
        <p className="mt-2 text-sm text-stone-500">Selecciona restaurants amb el botó Afegeix a la ruta. Amb la ubicació activa, la ruta surt de tu.</p>
      ) : (
        plan !== null && (
          <>
            <p className="mt-2 text-sm text-stone-700">
              {plan.totalKm.toFixed(1)} km en total · aprox. {plan.driveMinutes} min en cotxe
            </p>
            <ol className="mt-3 space-y-2 text-sm">
              {plan.stops.map((s, i) => (
                <li key={s.id} className="flex items-center justify-between gap-2">
                  <span>
                    {i + 1}. {s.name} <span className="text-stone-500">· {s.city}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <a href={s.googleMapsUrl || mapsUrl(s.name, s.city)} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">
                      Mapa
                    </a>
                    <button type="button" onClick={() => onRemove(s.id)} className="text-stone-500 hover:text-stone-900" aria-label={`Elimina ${s.name}`}>
                      ×
                    </button>
                  </span>
                </li>
              ))}
            </ol>
          </>
        )
      )}
    </section>
  );
}
