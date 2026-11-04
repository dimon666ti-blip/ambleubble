import { Settings, Sprout } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
}

export default function Header({ onOpenSettings }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/70 bg-calm-white/85 backdrop-blur-md dark:bg-slate-900/85">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-calm-mint-200 shadow-soft-sm">
            <Sprout className="h-6 w-6 text-calm-mint-800" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xl font-bold leading-tight text-slate-800 dark:text-white">I CAN</p>
            <p className="text-xs text-slate-600 dark:text-white">Маленькі дії. Великі зміни.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Налаштування"
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-600 dark:text-white shadow-soft-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-calm-sky-100 hover:text-calm-sky-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-calm-sky-300"
        >
          <Settings className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
