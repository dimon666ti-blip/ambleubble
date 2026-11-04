import { HeartPulse } from 'lucide-react';
import MoodScale from '@/components/MoodScale';
import { pluralizePoints } from '@/lib/mood';
import type { Session } from '@/types';

interface MoodCheckInProps {
  session: Session;
  onChange: (value: number) => void;
}

export default function MoodCheckIn({ session, onChange }: MoodCheckInProps) {
  const before = typeof session.moodBefore === 'number' ? session.moodBefore : null;
  const after = typeof session.moodAfter === 'number' ? session.moodAfter : null;
  const delta = before !== null && after !== null ? before - after : null;

  return (
    <section className="rounded-3xl bg-white p-6 shadow-soft sm:p-8 dark:bg-slate-800 dark:shadow-none">
      <div className="flex items-start gap-3">
        <HeartPulse className="mt-0.5 h-5 w-5 shrink-0 text-calm-sky-800 dark:text-calm-sky-300" aria-hidden="true" />
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Як ти почуваєшся зараз?</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-white">
            {before !== null
              ? `На початку ти оцінив стан на ${before}/${10}. Порівняй із тим, як зараз.`
              : 'Оціни свій стан після кроків — так з’явиться графік того, що працює саме для тебе.'}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <MoodScale
          label="Мій стан зараз"
          hint="Не обов’язково чекати, доки зробиш усі три кроки. Оцінюй у будь-який момент."
          value={after}
          onChange={onChange}
        />
      </div>

      {delta !== null && (
        <p
          role="status"
          className={`mt-4 rounded-2xl px-4 py-3 text-sm font-semibold ${
            delta > 0
              ? 'bg-calm-mint-50 text-calm-mint-800 dark:bg-emerald-900/30 dark:text-calm-mint-200'
              : delta < 0
                ? 'bg-rose-50 text-rose-800 dark:bg-rose-900/30 dark:text-rose-200'
                : 'bg-calm-lavender-50 text-slate-700 dark:bg-slate-700 dark:text-white'
          }`}
        >
          {delta > 0
            ? `Стало легше на ${delta} ${pluralizePoints(delta)}. Це вже перемога — запам’ятай цей крок.`
            : delta < 0
              ? `Зараз важче на ${Math.abs(delta)} ${pluralizePoints(delta)}. Це нормально: іноді потрібен час. Спробуй найменший крок ще раз.`
              : 'Поки без змін. Навіть маленька дія має значення — іноді ефект приходить пізніше.'}
        </p>
      )}
    </section>
  );
}
