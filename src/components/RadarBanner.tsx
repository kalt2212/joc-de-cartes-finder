import type { RadarHit } from '../lib/radar';
import { MAX_RADIUS_KM } from '../lib/radar';

interface RadarBannerProps {
  enabled: boolean;
  hits: RadarHit[];
  radiusKm: number;
  onRadiusChange: (km: number) => void;
  onToggle: () => void;
}

const RADII = [2, 5, MAX_RADIUS_KM] as const;

export default function RadarBanner({ enabled, hits, radiusKm, onRadiusChange, onToggle }: RadarBannerProps) {
  return (
    <section className="mb-6 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-stone-900">Radar Tens a prop</p>
          <p className="text-xs text-stone-500">Guanyadors i restaurants de Marc Ribas a prop teu. Opcional, només mentre l'app és oberta.</p>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="shrink-0 rounded-full border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-100"
        >
          {enabled ? 'Desactiva' : 'Activa'}
        </button>
      </div>

      {enabled && (
        <div className="mt-3">
          <label className="flex items-center gap-2 text-sm text-stone-700">
            Radi
            <select
              value={radiusKm}
              onChange={(e) => onRadiusChange(Number(e.target.value))}
              className="rounded-lg border border-stone-300 bg-stone-50 px-2 py-1 text-sm"
            >
              {RADII.map((km) => (
                <option key={km} value={km}>
                  {km} km
                </option>
              ))}
            </select>
          </label>
          {hits.length === 0 ? (
            <p className="mt-2 text-sm text-stone-500">Cap guanyador ni restaurant de Marc Ribas dins d'aquest radi.</p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm">
              {hits.slice(0, 3).map((h) => (
                <li key={h.restaurant.id} className="text-stone-800">
                  {h.restaurant.name} <span className="text-emerald-700">· {h.distanceKm.toFixed(1)} km</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
