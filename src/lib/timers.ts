export type TimerStatus = 'idle' | 'running' | 'paused' | 'finished';

export interface TimerState {
  status: TimerStatus;
  remaining: number;
}

interface TimerRecord {
  status: TimerStatus;
  remaining: number;
  updatedAt: number;
}

const STORAGE_KEY = 'ican.timers';

const TIMER_STATUSES: TimerStatus[] = ['idle', 'running', 'paused', 'finished'];

function isTimerRecord(value: unknown): value is TimerRecord {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<TimerRecord>;
  return (
    typeof candidate.status === 'string' &&
    TIMER_STATUSES.includes(candidate.status as TimerStatus) &&
    typeof candidate.remaining === 'number' &&
    Number.isFinite(candidate.remaining) &&
    candidate.remaining >= 0 &&
    typeof candidate.updatedAt === 'number' &&
    Number.isFinite(candidate.updatedAt)
  );
}

function readTimers(): Record<string, TimerRecord> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};

    const timers: Record<string, TimerRecord> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (isTimerRecord(value)) timers[key] = value;
    }
    return timers;
  } catch {
    return {};
  }
}

function writeTimers(timers: Record<string, TimerRecord>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
  } catch {
    // Storage may be unavailable; the timer keeps working for this visit.
  }
}

/**
 * Restores a timer and accounts for the time that passed while the page was closed.
 */
export function loadTimer(key: string, totalSeconds: number): TimerState {
  const record = readTimers()[key];
  if (!record) return { status: 'idle', remaining: totalSeconds };

  let remaining = Math.round(record.remaining);
  if (record.status === 'running') {
    const elapsed = Math.max(0, Math.floor((Date.now() - record.updatedAt) / 1000));
    remaining = Math.max(0, remaining - elapsed);
  }

  if (remaining === 0 && record.status !== 'idle') {
    return { status: 'finished', remaining: 0 };
  }

  return { status: record.status, remaining };
}

export function saveTimer(key: string, status: TimerStatus, remaining: number) {
  const timers = readTimers();
  timers[key] = { status, remaining: Math.max(0, Math.round(remaining)), updatedAt: Date.now() };
  writeTimers(timers);
}

export function clearTimersForSession(sessionId: string) {
  const timers = readTimers();
  const prefix = `${sessionId}:`;
  let changed = false;

  for (const key of Object.keys(timers)) {
    if (key.startsWith(prefix)) {
      delete timers[key];
      changed = true;
    }
  }

  if (changed) writeTimers(timers);
}

export function clearAllTimers() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clean up when storage is unavailable.
  }
}
