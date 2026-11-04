import { Sprout } from 'lucide-react';
import { SITUATION_EXAMPLES } from '@/lib/constants';

interface EmptyStateProps {
  onPickExample: (example: string) => void;
}

export default function EmptyState({ onPickExample }: EmptyStateProps) {
  return (
    <section className="flex flex-col items-center rounded-3xl bg-white p-6 text-center shadow-soft animate-fade-in-up sm:p-8 dark:bg-slate-800 dark:shadow-none">
      <div className="relative mb-6 flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-br from-calm-mint-100 to-calm-sky-100">
        <Sprout className="h-20 w-20 origin-bottom animate-sway text-calm-mint-800" strokeWidth={1.5} aria-hidden="true" />
      </div>
      <h2 className="text-2xl font-bold leading-tight text-slate-800 dark:text-white">Ти можеш більше, ніж тобі здається</h2>
      <p className="mt-3 max-w-md leading-relaxed text-slate-600 dark:text-white">
        Почни з однієї маленької дії. Опиши ситуацію ліворуч, і ми разом підберемо три прості кроки, які можна зробити
        вже сьогодні.
      </p>

      <div className="mt-8 w-full">
        <p className="mb-3 text-sm font-semibold text-slate-500">Або обери приклад, щоб почати:</p>
        <ul className="flex flex-col gap-2">
          {SITUATION_EXAMPLES.map((example) => (
            <li key={example}>
              <button
                type="button"
                onClick={() => onPickExample(example)}
                className="w-full rounded-2xl bg-calm-lavender-50 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:bg-calm-lavender-100 hover:shadow-soft-sm focus:outline-none focus-visible:ring-4 focus-visible:ring-calm-lavender-200"
              >
                {example}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
