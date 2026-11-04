import { useCallback, useEffect, useRef, useState } from 'react';
import Header from '@/components/Header';
import SettingsModal from '@/components/SettingsModal';
import SituationForm from '@/components/SituationForm';
import EmptyState from '@/components/EmptyState';
import StepsPanel from '@/components/StepsPanel';
import ControlCircle from '@/components/ControlCircle';
import MoodChart from '@/components/MoodChart';
import WinsHistory from '@/components/WinsHistory';
import SessionsArchive from '@/components/SessionsArchive';
import { generateAdvice } from '@/lib/advice';
import { EMPTY_SITUATION_INPUT } from '@/lib/constants';
import { clampMood } from '@/lib/mood';
import { clearTimersForSession } from '@/lib/timers';
import {
  loadActiveSessionId,
  loadSessions,
  loadWins,
  loadTheme,
  saveActiveSessionId,
  saveApiKey,
  saveAiModel,
  saveSessions,
  saveTheme,
  saveWins,
  loadApiKey,
  loadAiModel,
} from '@/lib/storage';
import type { Session, SituationInput, Win } from '@/types';

const EMPTY_DRAFT: SituationInput = { ...EMPTY_SITUATION_INPUT };

const PRAISE_MESSAGES = [
  { text: 'Молодець!', weight: 60 },
  { text: 'Так тримати!', weight: 30 },
  { text: 'У тебе все вийде!', weight: 9 },
  { text: 'Красавчик!', weight: 1 },
];

function pickPraise(): string {
  const roll = Math.random() * 100;
  let accumulated = 0;
  for (const message of PRAISE_MESSAGES) {
    accumulated += message.weight;
    if (roll < accumulated) return message.text;
  }
  return PRAISE_MESSAGES[0].text;
}

function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function focusSituationField() {
  document.getElementById('situation')?.focus();
}

function getSessionDate(session: Session): string {
  const timestamp = parseInt(session.id.split('-')[0], 36);
  const date = Number.isNaN(timestamp) ? new Date() : new Date(timestamp);
  return new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

export default function App() {
  const [apiKey, setApiKey] = useState<string>(loadApiKey);
  const [model, setModel] = useState<string>(loadAiModel);
  const [theme, setTheme] = useState<string>(loadTheme);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [draft, setDraft] = useState<SituationInput>(EMPTY_DRAFT);
  const [sessions, setSessions] = useState<Session[]>(loadSessions);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(loadActiveSessionId);
  const [wins, setWins] = useState<Win[]>(loadWins);
  const [isLoading, setIsLoading] = useState(false);
  const [praise, setPraise] = useState<string | null>(null);
  const praiseTimeoutRef = useRef<number | null>(null);

  const session = sessions.find((item) => item.id === activeSessionId) ?? null;

  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  useEffect(() => {
    saveActiveSessionId(activeSessionId);
  }, [activeSessionId]);

  useEffect(() => {
    const resolved =
      theme === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : theme;
    document.documentElement.classList.toggle('dark', resolved === 'dark');
    saveTheme(theme);
  }, [theme]);

  useEffect(() => {
    saveWins(wins);
  }, [wins]);

  useEffect(() => {
    return () => {
      if (praiseTimeoutRef.current !== null) {
        window.clearTimeout(praiseTimeoutRef.current);
      }
    };
  }, []);

  const closeSettings = useCallback(() => setIsSettingsOpen(false), []);

  const handleSaveSettings = (nextKey: string, nextModel: string, nextTheme: string) => {
    setApiKey(nextKey);
    saveApiKey(nextKey);
    setModel(nextModel);
    saveAiModel(nextModel);
    setTheme(nextTheme);
    setIsSettingsOpen(false);
  };

  const handleGenerate = async (input: SituationInput) => {
    setIsLoading(true);
    const advice = await generateAdvice({ ...input, apiKey, model });
    const newSession: Session = { ...input, id: createId(), advice, completedStepIds: [] };
    if (activeSessionId) clearTimersForSession(activeSessionId);
    setSessions((previous) => [newSession, ...previous]);
    setActiveSessionId(newSession.id);
    setIsLoading(false);
  };

  const handleToggleStep = (stepId: string) => {
    if (!session) return;

    const isDone = session.completedStepIds.includes(stepId);
    const winId = `${session.id}:${stepId}`;

    const newCompleted = isDone
      ? session.completedStepIds.filter((id) => id !== stepId)
      : [...session.completedStepIds, stepId];

    setSessions((previous) =>
      previous.map((item) => (item.id === session.id ? { ...item, completedStepIds: newCompleted } : item)),
    );

    if (isDone) {
      setWins((previous) => previous.filter((win) => win.id !== winId));
      return;
    }

    const step = session.advice.steps.find((item) => item.id === stepId);
    if (!step) return;

    const win: Win = {
      id: winId,
      situation: session.situation,
      stepTitle: step.title,
      completedAt: new Date().toISOString(),
    };
    setWins((previous) => [win, ...previous]);

    if (praiseTimeoutRef.current !== null) {
      window.clearTimeout(praiseTimeoutRef.current);
    }
    setPraise(pickPraise());
    praiseTimeoutRef.current = window.setTimeout(() => {
      setPraise(null);
      praiseTimeoutRef.current = null;
    }, 2400);
  };

  const handleRegenerate = async () => {
    if (!session) return;
    setIsLoading(true);
    const advice = await generateAdvice({
      situation: session.situation,
      emotion: session.emotion,
      difficulty: session.difficulty,
      apiKey,
      model,
    });
    clearTimersForSession(session.id);
    const newId = createId();
    const updated: Session = { ...session, id: newId, advice, completedStepIds: [], moodAfter: null, moodUpdatedAt: undefined };
    setSessions((previous) => [updated, ...previous.filter((item) => item.id !== session.id)]);
    setActiveSessionId(newId);
    setIsLoading(false);
  };

  const handleReflectionChange = (value: string) => {
    if (!session) return;
    setSessions((previous) =>
      previous.map((item) => (item.id === session.id ? { ...item, reflection: value } : item)),
    );
  };

  const handleMoodChange = (value: number) => {
    if (!session) return;
    const moodAfter = clampMood(value);
    setSessions((previous) =>
      previous.map((item) =>
        item.id === session.id
          ? { ...item, moodAfter, moodUpdatedAt: new Date().toISOString() }
          : item,
      ),
    );
  };

  const handleNewSituation = () => {
    setActiveSessionId(null);
    setDraft(EMPTY_DRAFT);
    focusSituationField();
  };

  const handlePickExample = (example: string) => {
    setDraft((previous) => ({ ...previous, situation: example }));
    focusSituationField();
  };

  const handleOpenSession = (id: string) => {
    setActiveSessionId(id);
  };

  const handleDeleteSession = (id: string) => {
    clearTimersForSession(id);
    setSessions((previous) => previous.filter((item) => item.id !== id));
    if (activeSessionId === id) setActiveSessionId(null);
  };

  const handleExportData = () => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      sessions,
      wins,
      model,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ican-backup.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (Array.isArray(parsed.sessions)) {
          setSessions(parsed.sessions);
        }
        if (Array.isArray(parsed.wins)) {
          setWins(parsed.wins);
        }
        if (typeof parsed.model === 'string') {
          setModel(parsed.model);
          saveAiModel(parsed.model);
        }
        setActiveSessionId(parsed.sessions?.[0]?.id ?? null);
      } catch {
        window.alert('Не вдалося прочитати файл. Перевірте формат JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllData = () => {
    if (!window.confirm('Видалити всі дані, сесії та історію перемог? Цю дію не можна скасувати.')) return;
    sessions.forEach((item) => clearTimersForSession(item.id));
    setSessions([]);
    setActiveSessionId(null);
    setWins([]);
    setApiKey('');
    saveApiKey('');
    setModel(loadAiModel());
  };

  const statusMessage = isLoading
    ? 'Підбираю кроки для тебе…'
    : session
      ? 'Готово. Три кроки нижче.'
      : '';

  return (
    <div className="relative min-h-screen overflow-x-hidden font-sans text-slate-800 dark:text-white">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-xl focus:bg-white focus:px-4 focus:py-3 focus:font-bold focus:text-slate-900 focus:shadow-soft focus:outline-none focus-visible:ring-4 focus-visible:ring-calm-sky-300"
      >
        Перейти до основного вмісту
      </a>

      <p className="sr-only" role="status" aria-live="polite">
        {statusMessage}
      </p>

      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden dark:opacity-20">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-calm-sky-200/60 blur-3xl animate-float" />
        <div className="absolute -right-16 top-1/3 h-80 w-80 rounded-full bg-calm-lavender-200/50 blur-3xl animate-float" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-calm-mint-200/50 blur-3xl animate-float" />
      </div>

      <Header onOpenSettings={() => setIsSettingsOpen(true)} />

      <main id="main-content" tabIndex={-1} className="mx-auto max-w-5xl px-4 pb-16 pt-6 focus:outline-none sm:px-6 lg:pt-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-start">
          <SituationForm
            value={draft}
            isLoading={isLoading}
            onChange={(patch) => setDraft((previous) => ({ ...previous, ...patch }))}
            onSubmit={handleGenerate}
          />

          <div className="space-y-6">
            {session ? (
              <>
                <StepsPanel
                  session={session}
                  isLoading={isLoading}
                  onToggleStep={handleToggleStep}
                  onRegenerate={handleRegenerate}
                  onReflectionChange={handleReflectionChange}
                  onMoodChange={handleMoodChange}
                  onNewSituation={handleNewSituation}
                />
                <ControlCircle canControl={session.advice.canControl} cannotControl={session.advice.cannotControl} />
              </>
            ) : (
              <EmptyState onPickExample={handlePickExample} />
            )}
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <MoodChart sessions={sessions} />
          <WinsHistory wins={wins} onClear={() => setWins([])} />
          <SessionsArchive
            sessions={sessions}
            activeSessionId={activeSessionId}
            onOpen={handleOpenSession}
            onDelete={handleDeleteSession}
            getSessionDate={getSessionDate}
          />
          <section className="rounded-3xl bg-white p-6 shadow-soft sm:p-8">
            <h2 className="text-xl font-bold text-slate-800">Дані</h2>
            <p className="mt-1 text-sm text-slate-500">
              Експорт, імпорт і повне видалення. Ключ API не експортується.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleExportData}
                className="rounded-xl bg-calm-sky-100 px-4 py-2.5 text-sm font-bold text-slate-800 transition-all duration-300 hover:-translate-y-0.5 hover:bg-calm-sky-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-calm-sky-200"
              >
                Експортувати JSON
              </button>
              <label className="cursor-pointer rounded-xl bg-calm-lavender-100 px-4 py-2.5 text-sm font-bold text-slate-800 transition-all duration-300 hover:-translate-y-0.5 hover:bg-calm-lavender-200 focus-within:ring-4 focus-within:ring-calm-lavender-200">
                Імпортувати JSON
                <input
                  type="file"
                  accept="application/json"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) handleImportData(file);
                    event.target.value = '';
                  }}
                />
              </label>
              <button
                type="button"
                onClick={handleClearAllData}
                className="rounded-xl bg-rose-100 px-4 py-2.5 text-sm font-bold text-rose-800 transition-all duration-300 hover:-translate-y-0.5 hover:bg-rose-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-rose-200"
              >
                Видалити всі дані
              </button>
            </div>
          </section>
        </div>

        <p className="mt-10 text-center text-sm text-slate-500 dark:text-white">
          Тобі не потрібно змінювати все одразу. Почни з одного маленького кроку!
        </p>

        <div className="mt-6 flex justify-center no-print">
          <img
            src="/giphy.gif"
            alt=""
            aria-hidden="true"
            className="h-12 w-12 rounded-lg opacity-70"
          />
        </div>
      </main>

      {praise && (
        <div
          className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-pop-in no-print"
          role="status"
          aria-live="polite"
        >
          <div className="rounded-2xl bg-calm-mint-800 px-6 py-3 text-lg font-bold text-white shadow-soft">
            {praise}
          </div>
        </div>
      )}

      {isSettingsOpen && (
        <SettingsModal
          apiKey={apiKey}
          model={model}
          theme={theme}
          onClose={closeSettings}
          onSave={handleSaveSettings}
        />
      )}
    </div>
  );
}