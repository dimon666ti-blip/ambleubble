import { useId } from 'react';
import { MOOD_MAX, MOOD_MIN, describeMood } from '@/lib/mood';

interface MoodScaleProps {
  label: string;
  hint?: string;
  value: number | null;
  onChange: (value: number) => void;
  lowLabel?: string;
  highLabel?: string;
}

const FALLBACK_VALUE = 5;

export default function MoodScale({
  label,
  hint,
  value,
  onChange,
  lowLabel = 'Легко',
  highLabel = 'Дуже важко',
}: MoodScaleProps) {
  const inputId = useId();
  const hintId = `${inputId}-hint`;
  const current = value ?? FALLBACK_VALUE;
  const isUnset = value === null;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={inputId} className="text-sm font-semibold text-slate-700 dark:text-white">
          {label}
        </label>
        <span
          className={`font-mono text-2xl font-bold tabular-nums ${
            isUnset ? 'text-slate-400 dark:text-slate-500' : 'text-calm-sky-800 dark:text-calm-sky-300'
          }`}
          aria-hidden="true"
        >
          {isUnset ? '—' : value}
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">/{MOOD_MAX}</span>
        </span>
      </div>

      <input
        id={inputId}
        type="range"
        min={MOOD_MIN}
        max={MOOD_MAX}
        step={1}
        value={current}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-valuetext={value === null ? 'Ще не оцінено' : `${value} з ${MOOD_MAX} — ${describeMood(value)}`}
        aria-describedby={hint ? hintId : undefined}
        data-unset={isUnset ? 'true' : undefined}
        className="mood-range mt-3 w-full cursor-pointer"
      />

      <div className="mt-1 flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
        <span>
          {MOOD_MIN} · {lowLabel}
        </span>
        <span>
          {highLabel} · {MOOD_MAX}
        </span>
      </div>

      {hint ? (
        <p id={hintId} className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
