import { AI_MODEL_OPTIONS, DEFAULT_MODEL, THEME_OPTIONS } from '@/lib/constants';
import type { Session, Win } from '@/types';

const KEYS = {
  apiKey: 'ican.openrouterApiKey',
  model: 'ican.aiModel',
  sessions: 'ican.sessions',
  activeSession: 'ican.activeSessionId',
  legacySession: 'ican.currentSession',
  wins: 'ican.wins',
} as const;

function readJson(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be full or disabled; the app keeps working for the current visit.
  }
}

function isSession(value: unknown): value is Session {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<Session>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.situation === 'string' &&
    Array.isArray(candidate.completedStepIds) &&
    Array.isArray(candidate.advice?.steps) &&
    candidate.advice.steps.length > 0
  );
}

function migrateLegacySession(): Session[] {
  const value = readJson(KEYS.legacySession);
  if (!isSession(value)) return [];

  const migrated = [value];
  writeJson(KEYS.sessions, migrated);
  try {
    window.localStorage.setItem(KEYS.activeSession, value.id);
    window.localStorage.removeItem(KEYS.legacySession);
  } catch {
    // Ignore storage errors; migration will retry next time.
  }
  return migrated;
}

export function loadSessions(): Session[] {
  const value = readJson(KEYS.sessions);
  if (Array.isArray(value)) {
    return value.filter(isSession);
  }
  return migrateLegacySession();
}

export function saveSessions(sessions: Session[]) {
  writeJson(KEYS.sessions, sessions);
}

export function loadActiveSessionId(): string | null {
  try {
    return window.localStorage.getItem(KEYS.activeSession);
  } catch {
    return null;
  }
}

export function saveActiveSessionId(id: string | null) {
  try {
    if (id) {
      window.localStorage.setItem(KEYS.activeSession, id);
    } else {
      window.localStorage.removeItem(KEYS.activeSession);
    }
  } catch {
    // Storage can be disabled; the active session then lasts only for this visit.
  }
}

export function loadTheme(): string {
  try {
    const saved = window.localStorage.getItem('ican.theme');
    return saved && THEME_OPTIONS.some((option) => option.value === saved) ? saved : 'system';
  } catch {
    return 'system';
  }
}

export function saveTheme(theme: string) {
  try {
    window.localStorage.setItem('ican.theme', theme);
  } catch {
    // Storage can be disabled; the default theme is used instead.
  }
}
export function loadApiKey(): string {
  try {
    return window.localStorage.getItem(KEYS.apiKey) ?? '';
  } catch {
    return '';
  }
}

export function saveApiKey(apiKey: string) {
  try {
    if (apiKey) {
      window.localStorage.setItem(KEYS.apiKey, apiKey);
    } else {
      window.localStorage.removeItem(KEYS.apiKey);
    }
  } catch {
    // Storage can be disabled; the key then lasts only for this visit.
  }
}

export function loadAiModel(): string {
  try {
    const saved = window.localStorage.getItem(KEYS.model);
    return saved && AI_MODEL_OPTIONS.some((option) => option.value === saved) ? saved : DEFAULT_MODEL;
  } catch {
    return DEFAULT_MODEL;
  }
}

export function saveAiModel(model: string) {
  try {
    window.localStorage.setItem(KEYS.model, model);
  } catch {
    // Storage can be disabled; the default model is used instead.
  }
}

// Backward-compatible helpers used by older code and tests.
export function loadSession(): Session | null {
  const sessions = loadSessions();
  const activeId = loadActiveSessionId();
  return sessions.find((session) => session.id === activeId) ?? sessions[0] ?? null;
}

export function saveSession(session: Session | null) {
  if (session) {
    const sessions = loadSessions();
    const index = sessions.findIndex((item) => item.id === session.id);
    if (index >= 0) {
      sessions[index] = session;
    } else {
      sessions.unshift(session);
    }
    saveSessions(sessions);
    saveActiveSessionId(session.id);
  } else {
    saveActiveSessionId(null);
  }
}

export function loadWins(): Win[] {
  const value = readJson(KEYS.wins);
  return Array.isArray(value) ? (value as Win[]) : [];
}

export function saveWins(wins: Win[]) {
  writeJson(KEYS.wins, wins);
}

export function clearAllAppData() {
  try {
    Object.keys(window.localStorage)
      .filter((key) => key.startsWith('ican.'))
      .forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // Nothing to clean up when storage is unavailable.
  }
}
