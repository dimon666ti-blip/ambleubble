import type { ReactNode } from 'react';
import { Cloud, Leaf } from 'lucide-react';
import type { Advice } from '@/types';

interface ControlCircleProps {
  canControl: Advice['canControl'];
  cannotControl: Advice['cannotControl'];
}

export default function ControlCircle({ canControl, cannotControl }: ControlCircleProps) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-soft sm:p-8 dark:bg-slate-800 dark:shadow-none animate-fade-in-up">
      <h2 className="text-xl font-bold text-slate-800 dark:text-white">Коло контролю</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-white">Зосередься на тому, що справді залежить від тебе.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <ControlColumn
          title="Я можу контролювати"
          items={canControl}
          icon={<Leaf className="h-5 w-5 text-calm-mint-800" aria-hidden="true" />}
          className="bg-calm-mint-50 border-calm-mint-200"
        />
        <ControlColumn
          title="Я не можу контролювати"
          items={cannotControl}
          icon={<Cloud className="h-5 w-5 text-slate-600" aria-hidden="true" />}
          className="bg-calm-lavender-50 border-calm-lavender-200"
        />
      </div>
    </section>
  );
}

interface ControlColumnProps {
  title: string;
  items: string[];
  icon: ReactNode;
  className: string;
}

function ControlColumn({ title, items, icon, className }: ControlColumnProps) {
  return (
    <div className={`rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft-sm ${className}`}>
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="font-bold text-slate-800 dark:text-white">{title}</h3>
      </div>
      <ul className="mt-4 space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-slate-700">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
