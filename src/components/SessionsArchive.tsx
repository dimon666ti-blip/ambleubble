import { Trash2 } from 'lucide-react';
import type { Session } from '@/types';

interface SessionsArchiveProps {
  sessions: Session[];
  activeSessionId: string | null;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  getSessionDate: (session: Session) => string;
}

export default function SessionsArchive({ sessions, activeSessionId, onOpen, onDelete, getSessionDate }: SessionsArchiveProps) {
  if (sessions.length === 0) {
    return (
      <section className="rounded-3xl bg-white p-6 shadow-soft sm:p-8 dark:bg-slate-800 dark:shadow-none">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Архів сесій</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-white">Тут з’являтимуться твої ситуації та поради</p>
        <p className="mt-6 rounded-2xl bg-calm-sky-50 p-5 text-center text-slate-600">
          Створи першу ситуацію, і вона збережеться тут.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl bg-white p-6 shadow-soft sm:p-8 dark:bg-slate-800 dark:shadow-none">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Архів сесій</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-white">
            Збережено ситуацій: {sessions.length}
          </p>
        </div>
      </div>

      <ul className="mt-6 space-y-3">
        {sessions.map((session) => {
          const isActive = session.id === activeSessionId;
          const completed = session.completedStepIds.length;
          const total = session.advice.steps.length;
          const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

          return (
            <li
              key={session.id}
              className={`rounded-2xl border p-4 transition-all duration-300 ${
                isActive ? 'border-calm-sky-300 bg-calm-sky-50 shadow-soft-sm' : 'border-slate-200 bg-white hover:shadow-soft-sm'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-bold leading-snug text-slate-800 dark:text-white line-clamp-2">{session.situation}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-white">
                    {getSessionDate(session)} · {completed} з {total} кроків · {progress}%
                    {session.advice.source === 'ai' ? ' · AI' : ' · базова'}
                    {typeof session.moodBefore === 'number' && typeof session.moodAfter === 'number'
                      ? ` · стан ${session.moodBefore}→${session.moodAfter}`
                      : ''}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {!isActive && (
                    <button
                      type="button"
                      onClick={() => onOpen(session.id)}
                      className="rounded-xl bg-calm-sky-100 px-3 py-2 text-sm font-bold text-slate-800 dark:text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-calm-sky-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-calm-sky-200"
                    >
                      Відкрити
                    </button>
                  )}
                  {isActive && (
                    <span className="rounded-xl bg-calm-mint-100 px-3 py-2 text-sm font-bold text-calm-mint-800">
                      Активна
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => onDelete(session.id)}
                    aria-label={`Видалити сесію «${session.situation}»`}
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-rose-200"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
              {session.reflection && (
                <p className="mt-3 line-clamp-2 rounded-xl bg-white/70 px-3 py-2 text-xs text-slate-600">
                  💭 {session.reflection}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
