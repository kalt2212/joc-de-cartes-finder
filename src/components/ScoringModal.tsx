import { useEffect, useState } from 'react';
import type { Restaurant } from '../types';
import {
  computeUserScore,
  compareWithOfficial,
  buildShareText,
  buildTweetText,
  buildTweetIntentUrl,
  loadHandle,
  saveHandle,
  normalizeHandle,
} from '../lib/scoring';
import type { UserScore, KeyValueStore } from '../lib/scoring';
import { BTN_GHOST, BTN_PRIMARY, BTN_SECONDARY } from '../lib/buttonStyles';

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

function getLocalStore(): KeyValueStore | null {
  return typeof window === 'undefined' ? null : window.localStorage;
}

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
  const [handleInput, setHandleInput] = useState<string>(() => loadHandle(getLocalStore()));

  // Escape closes the dialog for keyboard users.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const score = computeUserScore({ ...values, platEstrella });
  const diff = compareWithOfficial(score, restaurant.rating);
  const shareText = buildShareText(restaurant.name, score, restaurant.rating);

  const trimmedHandle = handleInput.trim();
  const validHandle = trimmedHandle === '' ? null : normalizeHandle(trimmedHandle);
  const handleInvalid = trimmedHandle !== '' && validHandle === null;
  const tweetText = buildTweetText({
    name: restaurant.name,
    userScore: score,
    platEstrella,
    handle: validHandle,
  });
  const tweetUrl = buildTweetIntentUrl(tweetText);

  const update = (key: CriterionKey, value: number) => {
    setValues((v) => ({ ...v, [key]: value }));
    onSave?.({ ...values, [key]: value, platEstrella });
  };

  const togglePlat = (checked: boolean) => {
    setPlatEstrella(checked);
    onSave?.({ ...values, platEstrella: checked });
  };

  const changeHandle = (raw: string) => {
    setHandleInput(raw);
    saveHandle(getLocalStore(), raw);
  };

  const copy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const shareToX = () => {
    window.open(tweetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center bg-stone-900/40 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="scoring-modal-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="scoring-modal-title" className="text-lg font-semibold">Tu Joc de Cartes</h2>
            <p className="text-sm text-stone-500">{restaurant.name}</p>
          </div>
          <button type="button" onClick={onClose} className={`${BTN_GHOST} px-3 py-1`} aria-label="Tanca">
            Tanca
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {CRITERIA.map((c) => (
            <label key={c.key} className="block text-sm">
              <span className="flex justify-between font-medium text-stone-700">
                {c.label}
                <span className="tabular-nums" aria-hidden="true">{values[c.key]}/10</span>
              </span>
              <input
                type="range"
                min={0}
                max={10}
                step={0.5}
                value={values[c.key]}
                aria-valuetext={`${values[c.key]} de 10`}
                onChange={(e) => update(c.key, Number(e.target.value))}
                className="w-full cursor-pointer accent-amber-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
              />
            </label>
          ))}
        </div>

        <label className="mt-4 flex cursor-pointer items-center gap-2 rounded-lg px-1 py-1 text-sm text-stone-700 transition hover:bg-stone-50">
          <input
            type="checkbox"
            checked={platEstrella}
            onChange={(e) => togglePlat(e.target.checked)}
            className="h-4 w-4 cursor-pointer accent-amber-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
          />
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

        <div className="mt-4 space-y-1.5">
          <label htmlFor="x-handle-input" className="block text-sm font-medium text-stone-700">
            El teu handle de X (opcional)
          </label>
          <input
            id="x-handle-input"
            type="text"
            inputMode="text"
            autoComplete="username"
            spellCheck={false}
            placeholder="@el_teu_handle"
            value={handleInput}
            onChange={(e) => changeHandle(e.target.value)}
            aria-invalid={handleInvalid}
            aria-describedby="x-handle-help"
            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 aria-[invalid=true]:border-rose-400"
          />
          <p id="x-handle-help" className={`text-xs ${handleInvalid ? 'text-rose-700' : 'text-stone-500'}`}>
            {handleInvalid
              ? 'Format no vàlid: 1 a 15 lletres, números o guions baixos.'
              : 'Es guarda al teu dispositiu per no haver-lo d\'escriure cada vegada.'}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
          {copied && (
            <span role="status" className="text-xs font-medium text-emerald-700">
              Copiat
            </span>
          )}
          <button type="button" onClick={copy} className={BTN_SECONDARY}>
            Copia el resultat
          </button>
          <button
            type="button"
            onClick={shareToX}
            className={BTN_PRIMARY}
            aria-label="Compartir veredicte a X, obre una nova finestra"
          >
            Compartir veredicte a X
          </button>
        </div>
      </div>
    </div>
  );
}
