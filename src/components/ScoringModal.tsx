import { useEffect, useState } from 'react';
import type { Restaurant } from '../types';
import { computeUserScore, compareWithOfficial, buildShareText } from '../lib/scoring';
import type { UserScore } from '../lib/scoring';

const CRITERIA = [
  { key: 'menjar', label: 'Menjar' },
  { key: 'servei', label: 'Servei' },
  { key: 'espai', label: 'Espai' },
  { key: 'cuina', label: 'Cuina' },
  { key: 'preu', label: 'Preu' },
] as const;

type CriterionKey = (typeof CRITERIA)[number]['key'];

const DEFAULT_VALUES: Record<CriterionKey, number> = {
  menjar: 5,
  servei: 5,
  espai: 5,
  cuina: 5,
  preu: 5,
};

interface ScoringModalProps {
  restaurant: Restaurant;
  initialScores?: UserScore;
  onSave?: (score: UserScore) => void;
  onClose: () => void;
}

export default function ScoringModal({ restaurant, initialScores, onSave, onClose }: ScoringModalProps) {
  const [values, setValues] = useState<Record<CriterionKey, number>>(() =>
    initialScores
      ? { menjar: initialScores.menjar, servei: initialScores.servei, espai: initialScores.espai, cuina: initialScores.cuina, preu: initialScores.preu }
      : DEFAULT_VALUES,
  );
  const [platEstrella, setPlatEstrella] = useState(initialScores?.platEstrella ?? false);
  const [copied, setCopied] = useState(false);

  // Tecla Escape tanca el diàleg (accessibilitat).
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const score = computeUserScore({ ...values, platEstrella });
  const diff = compareWithOfficial(score, restaurant.rating);
  const shareText = buildShareText(restaurant.name, score, restaurant.rating);

  const update = (key: CriterionKey, value: number) => {
    setValues((v) => ({ ...v, [key]: value }));
    onSave?.({ ...values, [key]: value, platEstrella });
  };

  const togglePlat = (checked: boolean) => {
    setPlatEstrella(checked);
    onSave?.({ ...values, platEstrella: checked });
  };

  const copy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 p-4 sm:items-center" role="dialog" aria-modal="true" aria-label="Tu Joc de Cartes">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Tu Joc de Cartes</h2>
            <p className="text-sm text-stone-500">{restaurant.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tanca"
            className="rounded-full px-3 py-1 text-sm text-stone-600 hover:bg-stone-100"
          >
            Tanca
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {CRITERIA.map((c) => (
            <label key={c.key} className="block text-sm">
              <span className="flex justify-between font-medium text-stone-700">
                {c.label}
                <span>{values[c.key]}/10</span>
              </span>
              <input
                type="range"
                min={0}
                max={10}
                step={0.5}
                value={values[c.key]}
                onChange={(e) => update(c.key, Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </label>
          ))}
        </div>

        <label className="mt-4 flex items-center gap-2 text-sm text-stone-700">
          <input type="checkbox" checked={platEstrella} onChange={(e) => togglePlat(e.target.checked)} className="accent-amber-500" />
          He menjat el plat estrella (+0,5)
        </label>

        <div className="mt-5 rounded-xl bg-stone-50 p-4 text-sm">
          <p className="text-base font-semibold text-stone-900">La meva nota: {score}/10</p>
          <p className="mt-1 text-stone-600">
            {restaurant.rating === null
              ? 'Sense nota oficial per comparar.'
              : `Nota oficial: ${restaurant.rating}/10 · Diferència: ${diff !== null && diff > 0 ? '+' : ''}${diff ?? 0}`}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          {copied && <span className="text-xs text-emerald-700">Copiat</span>}
          <button
            type="button"
            onClick={copy}
            className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700"
          >
            Copia el resultat
          </button>
        </div>
      </div>
    </div>
  );
}
