import { useState } from 'react';
import { CheckCircle2, RefreshCw, RotateCcw, Share2, Sparkles } from 'lucide-react';
import MoodCheckIn from '@/components/MoodCheckIn';
import StepCard from '@/components/StepCard';
import { PROGRESS_BY_COMPLETED } from '@/lib/constants';
import type { Session } from '@/types';

interface StepsPanelProps {
  session: Session;
  isLoading: boolean;
  onToggleStep: (stepId: string) => void;
  onRegenerate: () => void;
  onReflectionChange: (value: string) => void;
  onMoodChange: (value: number) => void;
  onNewSituation: () => void;
}

const ENCOURAGEMENT_BY_COMPLETED = [
  'Обери перший крок. Він може бути дуже маленьким, і це нормально.',
  'Перший крок зроблено. Ти вже дієш, і це важливо!',
  'Ще один крок, і ти на фінішній прямій. Так тримати!',
];

export default function StepsPanel({ session, isLoading, onToggleStep, onRegenerate, onReflectionChange, onMoodChange, onNewSituation }: StepsPanelProps) {
  const completedCount = session.completedStepIds.length;
  const progress = PROGRESS_BY_COMPLETED[completedCount];
  const isFinished = completedCount === session.advice.steps.length;
  const encouragement = isFinished ? null : ENCOURAGEMENT_BY_COMPLETED[completedCount];
  const [copied, setCopied] = useState(false);

  const handleExport = () => {
    window.print();
  };

  const handleShare = async () => {
    const text = [
      'I CAN — мій план',
      '',
      `Ситуація: ${session.situation}`,
      '',
      `Аналіз: ${session.advice.analysis}`,
      '',
      'Три кроки:',
      ...session.advice.steps.map((step, index) => `${index + 1}. ${step.title} (${step.minutes} хв)\n   ${step.description}`),
      '',
      'Можу контролювати:',
      ...session.advice.canControl.map((item) => `- ${item}`),
      '',
      'Не можу контролювати:',
      ...session.advice.cannotControl.map((item) => `- ${item}`),
      ...(typeof session.moodBefore === 'number' && typeof session.moodAfter === 'number'
        ? ['', `Самопочуття: ${session.moodBefore}/10 → ${session.moodAfter}/10`]
        : []),
    ].join('\n');

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: 'I CAN — мій план', text });
        return;
      } catch {
        // Fall through to clipboard.
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be unavailable; the print export still works.
    }
  };

  return (
    <section className="space-y-5 animate-fade-in-up">
      <div className="rounded-3xl bg-white p-6 shadow-soft sm:p-8 dark:bg-slate-800 dark:shadow-none">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-calm-sky-800">Твоя ситуація</p>
            <p className="mt-1 break-words text-slate-700 dark:text-white">{session.situation}</p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onNewSituation}
              className="flex items-center gap-2 rounded-xl bg-calm-lavender-100 px-4 py-2.5 text-sm font-bold text-slate-800 dark:text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-calm-lavender-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-calm-lavender-200"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Нова ситуація
            </button>
            <button
              type="button"
              onClick={onRegenerate}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-xl bg-calm-lavender-100 px-4 py-2.5 text-sm font-bold text-slate-800 dark:text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-calm-lavender-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-calm-lavender-200 disabled:cursor-wait disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
              {isLoading ? 'Оновлюю…' : 'Інші кроки'}
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="flex items-center gap-2 rounded-xl bg-calm-sky-100 px-4 py-2.5 text-sm font-bold text-slate-800 dark:text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-calm-sky-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-calm-sky-200"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Експортувати (PDF)
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-2 rounded-xl bg-calm-mint-100 px-4 py-2.5 text-sm font-bold text-slate-800 dark:text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-calm-mint-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-calm-mint-200"
            >
              <Share2 className="h-4 w-4" aria-hidden="true" />
              {copied ? 'Скопійовано' : 'Поділитися'}
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-calm-sky-50 p-5 dark:bg-slate-700">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-calm-sky-800" aria-hidden="true" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-bold text-slate-800 dark:text-white">Аналіз ситуації</h2>
                <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                  {session.advice.source === 'ai' ? 'Персональна порада' : 'Базова порада'}
                </span>
              </div>
              <p className="mt-2 leading-relaxed text-slate-700 dark:text-white">{session.advice.analysis}</p>

        {session.advice.keyThemes && session.advice.keyThemes.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-calm-sky-800">Ключові теми</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {session.advice.keyThemes.map((theme) => (
                <span
                  key={theme}
                  className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 dark:text-white shadow-soft-sm"
                >
                  {theme}
                </span>
              ))}
            </div>
          </div>
        )}

        {session.advice.underlyingNeed && (
          <p className="mt-4 rounded-2xl bg-white/70 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-white">
            <span className="text-calm-sky-800">Прихована потреба:</span> {session.advice.underlyingNeed}
          </p>
        )}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-soft sm:p-8 dark:bg-slate-800 dark:shadow-none">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 shrink-0 text-calm-sky-800" aria-hidden="true" />
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Питання для роздумів</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-white">
              Не поспішай відповідати. Обери одне і просто поміркуй.
            </p>
          </div>
        </div>

        <ul className="mt-5 space-y-3">
          {(session.advice.questions ?? []).map((question, index) => (
            <li
              key={`${index}-${question}`}
              className="flex gap-3 rounded-2xl bg-calm-sky-50 p-4 text-sm leading-relaxed text-slate-700 dark:text-white dark:bg-slate-700 dark:text-white"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-calm-sky-800 shadow-soft-sm">
                {index + 1}
              </span>
              <span>{question}</span>
            </li>
          ))}
        </ul>

        <label className="mt-5 block">
          <span className="text-sm font-semibold text-slate-700 dark:text-white">Мої думки (необов’язково)</span>
          <textarea
            value={session.reflection ?? ''}
            onChange={(event) => onReflectionChange(event.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="Тут можна записати все, що прийшло в голову. Ніхто, крім тебе, цього не прочитає."
            className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-calm-white p-4 text-sm leading-relaxed text-slate-800 dark:text-white placeholder:text-slate-400 focus:border-calm-sky-300 focus:outline-none focus:ring-4 focus:ring-calm-sky-100"
          />
        </label>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-soft sm:p-8 dark:bg-slate-800 dark:shadow-none">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Твої три кроки</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-white">
              Виконано {completedCount} з {session.advice.steps.length}
            </p>
          </div>
          <p className="text-2xl font-bold text-calm-mint-800 tabular-nums" aria-live="polite">
            {progress}%
          </p>
        </div>

        <div
          className="mt-4 h-3 w-full overflow-hidden rounded-full bg-calm-lavender-100 dark:bg-slate-700"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Прогрес виконання кроків"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-calm-sky-300 to-calm-mint-300 transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {encouragement && (
          <p className="mt-4 rounded-2xl bg-calm-lavender-50 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-white animate-fade-in dark:bg-slate-700 dark:text-white" key={completedCount}>
            {encouragement}
          </p>
        )}

        {isFinished && (
          <div className="mt-4 flex items-start gap-3 rounded-2xl bg-calm-mint-100 p-5 animate-pop-in dark:bg-emerald-900/40">
            <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-calm-mint-800" aria-hidden="true" />
            <p className="font-bold leading-relaxed text-calm-mint-800">
              Ти це зробив! Кожна маленька дія наближає тебе до змін 🌱
            </p>
          </div>
        )}

        <div className="mt-6 space-y-4">
          {session.advice.steps.map((step, index) => (
            <StepCard
              key={step.id}
              index={index + 1}
              step={step}
              timerKey={`${session.id}:${step.id}`}
              isDone={session.completedStepIds.includes(step.id)}
              onToggle={() => onToggleStep(step.id)}
            />
          ))}
        </div>
      </div>

      <MoodCheckIn session={session} onChange={onMoodChange} />

      <div className="print-plan hidden print:block">
        <h1>I CAN — мій план</h1>
        <p className="print-meta">
          {new Date().toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        <h2>Ситуація</h2>
        <p>{session.situation}</p>

        <h2>Аналіз</h2>
        <p>{session.advice.analysis}</p>
        {session.advice.underlyingNeed ? <p><strong>Прихована потреба:</strong> {session.advice.underlyingNeed}</p> : null}

        <h2>Питання для роздумів</h2>
        <ol>
          {(session.advice.questions ?? []).map((question, index) => (
            <li key={index}>{question}</li>
          ))}
        </ol>

        {session.reflection ? (
          <>
            <h2>Мої думки</h2>
            <p>{session.reflection}</p>
          </>
        ) : null}

        <h2>Три кроки</h2>
        <ol>
          {session.advice.steps.map((step) => (
            <li key={step.id}>
              <strong>{step.title}</strong> ({step.minutes} хв) — {step.description}
            </li>
          ))}
        </ol>

        <h2>Коло контролю</h2>
        <p>
          <strong>Можу контролювати:</strong> {session.advice.canControl.join(', ')}
        </p>
        <p>
          <strong>Не можу контролювати:</strong> {session.advice.cannotControl.join(', ')}
        </p>

        {typeof session.moodBefore === 'number' && typeof session.moodAfter === 'number' ? (
          <>
            <h2>Самопочуття</h2>
            <p>
              До кроків: {session.moodBefore}/10 · Після кроків: {session.moodAfter}/10
            </p>
          </>
        ) : null}

        <p className="print-footer">Маленькі дії. Великі зміни. · I CAN</p>
      </div>
    </section>
  );
}
