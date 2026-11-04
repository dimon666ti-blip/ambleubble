import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Check, Pause, Play } from 'lucide-react';
import { loadTimer, saveTimer, type TimerStatus } from '@/lib/timers';
import type { Step } from '@/types';

interface StepCardProps {
  index: number;
  step: Step;
  isDone: boolean;
  timerKey: string;
  onToggle: () => void;
}

interface TimerSnapshot {
  status: TimerStatus;
  remaining: number;
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function StepCard({ index, step, isDone, timerKey, onToggle }: StepCardProps) {
  const totalSeconds = step.minutes * 60;
  const [timer, setTimer] = useState<TimerSnapshot>(() => loadTimer(timerKey, totalSeconds));
  const deadlineRef = useRef<number | null>(
    timer.status === 'running' ? Date.now() + timer.remaining * 1000 : null,
  );
  const timeId = useId();
  const { status, remaining } = timer;

  const finishTimer = useCallback(() => {
    deadlineRef.current = null;
    setTimer({ status: 'finished', remaining: 0 });
    saveTimer(timerKey, 'finished', 0);
  }, [timerKey]);

  useEffect(() => {
    if (status !== 'running') return;

    const tick = () => {
      const deadline = deadlineRef.current;
      if (deadline === null) return;

      const nextRemaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setTimer((previous) =>
        previous.remaining === nextRemaining ? previous : { ...previous, remaining: nextRemaining },
      );

      if (nextRemaining === 0) finishTimer();
    };

    tick();
    const intervalId = window.setInterval(tick, 500);
    return () => window.clearInterval(intervalId);
  }, [status, finishTimer]);

  // Marking a step as done stops the countdown so it does not keep running in the background.
  useEffect(() => {
    if (!isDone || status !== 'running') return;

    const deadline = deadlineRef.current;
    const nextRemaining =
      deadline === null ? remaining : Math.max(0, Math.ceil((deadline - Date.now()) / 1000));

    deadlineRef.current = null;
    setTimer({ status: nextRemaining === 0 ? 'finished' : 'paused', remaining: nextRemaining });
    saveTimer(timerKey, nextRemaining === 0 ? 'finished' : 'paused', nextRemaining);
  }, [isDone, remaining, status, timerKey]);

  const handleTimerClick = () => {
    if (status === 'running') {
      const deadline = deadlineRef.current;
      const nextRemaining =
        deadline === null ? remaining : Math.max(0, Math.ceil((deadline - Date.now()) / 1000));

      deadlineRef.current = null;
      const nextStatus: TimerStatus = nextRemaining === 0 ? 'finished' : 'paused';
      setTimer({ status: nextStatus, remaining: nextRemaining });
      saveTimer(timerKey, nextStatus, nextRemaining);
      return;
    }

    const nextRemaining = status === 'paused' ? remaining : totalSeconds;
    deadlineRef.current = Date.now() + nextRemaining * 1000;
    setTimer({ status: 'running', remaining: nextRemaining });
    saveTimer(timerKey, 'running', nextRemaining);
  };

  const timerLabel =
    status === 'running' ? 'Пауза' : status === 'paused' ? 'Продовжити' : status === 'finished' ? 'Почати знову' : 'Почати';
  const TimerIcon = status === 'running' ? Pause : Play;
  const timerAriaLabel = `${timerLabel} таймер кроку ${index}: ${step.title}`;

  return (
    <article
      className={`rounded-2xl border p-5 transition-all duration-500 animate-fade-in-up ${
        isDone ? 'border-calm-mint-300 bg-calm-mint-50 shadow-soft-sm dark:bg-emerald-900/30' : 'border-slate-200 bg-white hover:shadow-soft-sm dark:bg-slate-800'
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base font-bold transition-colors duration-500 ${
            isDone ? 'bg-calm-mint-200 text-calm-mint-800' : 'bg-calm-sky-100 text-calm-sky-800'
          }`}
        >
          {isDone ? <Check className="h-5 w-5" aria-hidden="true" /> : index}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={`text-lg font-bold leading-snug ${isDone ? 'text-slate-500 dark:text-white line-through decoration-calm-mint-800/40' : 'text-slate-800 dark:text-white'}`}>
              {step.title}
            </h3>
            <span className="rounded-full bg-calm-lavender-100 dark:bg-slate-700 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
              {step.minutes} хв
            </span>
          </div>
          <p className="mt-2 leading-relaxed text-slate-600 dark:text-white">{step.description}</p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleTimerClick}
              disabled={isDone}
              aria-label={timerAriaLabel}
              aria-describedby={status !== 'idle' ? timeId : undefined}
              className="flex items-center gap-2 rounded-xl bg-calm-mint-200 px-4 py-2.5 text-sm font-bold text-calm-mint-800 transition-all duration-300 hover:-translate-y-0.5 hover:bg-calm-mint-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-calm-mint-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              <TimerIcon className="h-4 w-4" aria-hidden="true" />
              {timerLabel}
            </button>

            {status !== 'idle' && (
              <span
                id={timeId}
                role="timer"
                className={`font-mono text-sm font-semibold tabular-nums ${status === 'finished' ? 'text-calm-mint-800' : 'text-slate-600 dark:text-white'}`}
              >
                {status === 'finished' ? 'Час минув, ти молодець!' : formatTime(remaining)}
              </span>
            )}

            <label className="ml-auto flex cursor-pointer items-center gap-3 rounded-xl px-2 py-1.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-calm-sky-50">
              <input
                type="checkbox"
                checked={isDone}
                onChange={onToggle}
                aria-label={
                  isDone
                    ? `Позначити крок ${index} «${step.title}» невиконаним`
                    : `Позначити крок ${index} «${step.title}» виконаним`
                }
                className="peer sr-only"
              />
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-lg border-2 transition-all duration-300 peer-focus-visible:ring-4 peer-focus-visible:ring-calm-sky-200 ${
                  isDone ? 'border-calm-mint-800 bg-calm-mint-800 text-white' : 'border-slate-300 bg-white text-transparent'
                }`}
                aria-hidden="true"
              >
                <Check className="h-4 w-4" strokeWidth={3} />
              </span>
              Я це зробив!
            </label>
          </div>
        </div>
      </div>
    </article>
  );
}
