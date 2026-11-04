import type { Session } from '@/types';

export const MOOD_MIN = 1;
export const MOOD_MAX = 10;

const MOOD_DESCRIPTIONS: { max: number; label: string }[] = [
  { max: 2, label: 'зовсім легко' },
  { max: 4, label: 'майже спокійно' },
  { max: 6, label: 'помірно важко' },
  { max: 8, label: 'важко' },
  { max: 10, label: 'дуже важко' },
];

export function isValidMood(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= MOOD_MIN &&
    value <= MOOD_MAX
  );
}

export function clampMood(value: number): number {
  return Math.min(MOOD_MAX, Math.max(MOOD_MIN, Math.round(value)));
}

export function describeMood(value: number): string {
  const normalized = clampMood(value);
  const match = MOOD_DESCRIPTIONS.find((item) => normalized <= item.max);
  return match?.label ?? MOOD_DESCRIPTIONS[MOOD_DESCRIPTIONS.length - 1].label;
}

/** Ukrainian plural for "бал" (1 бал, 2 бали, 5 балів). */
export function pluralizePoints(value: number): string {
  const absolute = Math.abs(Math.round(value));
  const lastTwo = absolute % 100;
  const last = absolute % 10;

  if (lastTwo >= 11 && lastTwo <= 14) return 'балів';
  if (last === 1) return 'бал';
  if (last >= 2 && last <= 4) return 'бали';
  return 'балів';
}

/**
 * Session ids start with a base36 timestamp (`Date.now().toString(36)`),
 * so the creation time can be restored without an extra field.
 * Anything outside a sane date range is treated as unknown.
 */
export function getSessionTimestamp(session: Session): number {
  const timestamp = parseInt(session.id.split('-')[0], 36);
  if (Number.isNaN(timestamp)) return 0;

  const isSane = timestamp >= Date.UTC(2000, 0, 1) && timestamp <= Date.UTC(2100, 0, 1);
  return isSane ? timestamp : 0;
}

const DATE_FORMATTER = new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'short' });

export function formatMoodDate(timestamp: number): string {
  return DATE_FORMATTER.format(new Date(timestamp));
}

export interface MoodPoint {
  sessionId: string;
  timestamp: number;
  dateLabel: string;
  situation: string;
  before: number;
  after: number;
  /** Positive values mean the situation became easier after the steps. */
  delta: number;
}

export interface MoodStats {
  points: MoodPoint[];
  total: number;
  averageBefore: number | null;
  averageAfter: number | null;
  averageDelta: number | null;
  improved: number;
  unchanged: number;
  worsened: number;
}

function roundToOne(value: number): number {
  return Math.round(value * 10) / 10;
}

export function getMoodStats(sessions: Session[]): MoodStats {
  const points: MoodPoint[] = sessions
    .filter((session) => isValidMood(session.moodBefore) && isValidMood(session.moodAfter))
    .map((session) => {
      const timestamp = getSessionTimestamp(session);
      const before = session.moodBefore as number;
      const after = session.moodAfter as number;

      return {
        sessionId: session.id,
        timestamp,
        dateLabel: formatMoodDate(timestamp),
        situation: session.situation,
        before,
        after,
        delta: before - after,
      };
    })
    .sort((first, second) => first.timestamp - second.timestamp);

  const total = points.length;

  if (total === 0) {
    return {
      points,
      total: 0,
      averageBefore: null,
      averageAfter: null,
      averageDelta: null,
      improved: 0,
      unchanged: 0,
      worsened: 0,
    };
  }

  const sumBefore = points.reduce((sum, point) => sum + point.before, 0);
  const sumAfter = points.reduce((sum, point) => sum + point.after, 0);
  const sumDelta = points.reduce((sum, point) => sum + point.delta, 0);

  return {
    points,
    total,
    averageBefore: roundToOne(sumBefore / total),
    averageAfter: roundToOne(sumAfter / total),
    averageDelta: roundToOne(sumDelta / total),
    improved: points.filter((point) => point.delta > 0).length,
    unchanged: points.filter((point) => point.delta === 0).length,
    worsened: points.filter((point) => point.delta < 0).length,
  };
}
