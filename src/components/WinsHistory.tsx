import { useState } from 'react';
import { CheckCircle2, Trash2 } from 'lucide-react';
import type { Win } from '@/types';

interface WinsHistoryProps {
  wins: Win[];
  onClear: () => void;
}

const DATE_FORMATTER = new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });

export default function WinsHistory({ wins, onClear }: WinsHistoryProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleClear = () => {
    onClear();
    setIsConfirming(false);
  };

  return (
    <section className="rounded-3xl bg-white p-6 shadow-soft sm:p-8 dark:bg-slate-800 dark:shadow-none">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Мої маленькі перемоги</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-white" aria-live="polite">
            {wins.length > 0 ? `Уже зроблено кроків: ${wins.length}` : 'Тут з’являтимуться твої виконані кроки'}
          </p>
        </div>

        {wins.length > 0 &&
          (isConfirming ? (
            <div className="flex items-center gap-2 animate-fade-in">
              <span className="text-sm font-semibold text-slate-700">Точно очистити?</span>
              <button
                type="button"
                onClick={handleClear}
                className="rounded-xl bg-rose-100 px-3 py-2 text-sm font-bold text-rose-800 transition-colors hover:bg-rose-200"
              >
                Так, очистити
              </button>
              <button
                type="button"
                onClick={() => setIsConfirming(false)}
                className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200"
              >
                Ні
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsConfirming(true)}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 dark:text-white transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-white"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Очистити історію
            </button>
          ))}
      </div>

      {wins.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-calm-sky-50 dark:bg-slate-700 p-5 text-center text-slate-600 dark:text-white">
          Відміть перший крок як виконаний, і він з’явиться тут. Почни з найменшого!
        </p>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {wins.map((win) => (
            <li
              key={win.id}
              className="flex items-start gap-3 rounded-2xl border border-calm-mint-200 bg-calm-mint-50 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft-sm animate-fade-in-up"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-calm-mint-800" aria-hidden="true" />
              <div className="min-w-0">
                <p className="font-bold leading-snug text-slate-800 dark:text-white">{win.stepTitle}</p>
                <p className="mt-1 line-clamp-1 text-sm text-slate-600 dark:text-white">{win.situation}</p>
                <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-white">
                  {DATE_FORMATTER.format(new Date(win.completedAt))}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
