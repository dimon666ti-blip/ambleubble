import { describe, expect, it } from 'vitest';
import {
  clampMood,
  describeMood,
  getMoodStats,
  getSessionTimestamp,
  isValidMood,
  pluralizePoints,
} from '@/lib/mood';
import type { Advice, Session } from '@/types';

const EMPTY_ADVICE: Advice = {
  analysis: '',
  keyThemes: [],
  underlyingNeed: '',
  canControl: [],
  cannotControl: [],
  questions: [],
  steps: [{ id: 'step-1', title: 'Крок', description: 'Опис', minutes: 3 }],
  source: 'mock',
};

function makeSession(id: string, overrides: Partial<Session> = {}): Session {
  return {
    id,
    situation: 'Тестова ситуація',
    emotion: 'helpless',
    difficulty: 'easy',
    advice: EMPTY_ADVICE,
    completedStepIds: [],
    ...overrides,
  };
}

function idFor(isoDate: string): string {
  return `${new Date(isoDate).getTime().toString(36)}-test`;
}

describe('mood helpers', () => {
  it('validates the 1–10 range', () => {
    expect(isValidMood(1)).toBe(true);
    expect(isValidMood(10)).toBe(true);
    expect(isValidMood(0)).toBe(false);
    expect(isValidMood(11)).toBe(false);
    expect(isValidMood(5.5)).toBe(true);
    expect(isValidMood(Number.NaN)).toBe(false);
    expect(isValidMood('7')).toBe(false);
    expect(isValidMood(null)).toBe(false);
  });

  it('clamps and rounds values into the range', () => {
    expect(clampMood(-4)).toBe(1);
    expect(clampMood(4.4)).toBe(4);
    expect(clampMood(4.6)).toBe(5);
    expect(clampMood(42)).toBe(10);
  });

  it('describes mood values in Ukrainian', () => {
    expect(describeMood(1)).toBe('зовсім легко');
    expect(describeMood(5)).toBe('помірно важко');
    expect(describeMood(10)).toBe('дуже важко');
  });

  it('uses the correct Ukrainian plural for points', () => {
    expect(pluralizePoints(1)).toBe('бал');
    expect(pluralizePoints(3)).toBe('бали');
    expect(pluralizePoints(5)).toBe('балів');
    expect(pluralizePoints(11)).toBe('балів');
    expect(pluralizePoints(21)).toBe('бал');
  });

  it('restores the creation time from the session id', () => {
    const id = idFor('2025-03-04T10:00:00.000Z');
    expect(getSessionTimestamp(makeSession(id))).toBe(new Date('2025-03-04T10:00:00.000Z').getTime());
    expect(getSessionTimestamp(makeSession('not-a-timestamp'))).toBe(0);
  });
});

describe('getMoodStats', () => {
  it('returns empty statistics without mood data', () => {
    const stats = getMoodStats([makeSession('abc')]);

    expect(stats.total).toBe(0);
    expect(stats.points).toEqual([]);
    expect(stats.averageBefore).toBeNull();
    expect(stats.averageAfter).toBeNull();
    expect(stats.averageDelta).toBeNull();
  });

  it('ignores sessions that only have one of the two ratings', () => {
    const stats = getMoodStats([
      makeSession(idFor('2025-01-01T09:00:00Z'), { moodBefore: 8 }),
      makeSession(idFor('2025-01-02T09:00:00Z'), { moodAfter: 4 }),
    ]);

    expect(stats.total).toBe(0);
  });

  it('ignores invalid ratings', () => {
    const stats = getMoodStats([
      makeSession(idFor('2025-01-01T09:00:00Z'), { moodBefore: 0, moodAfter: 4 }),
      makeSession(idFor('2025-01-02T09:00:00Z'), { moodBefore: 11, moodAfter: 4 }),
    ]);

    expect(stats.total).toBe(0);
  });

  it('sorts points chronologically and computes averages', () => {
    const stats = getMoodStats([
      makeSession(idFor('2025-01-03T09:00:00Z'), { moodBefore: 5, moodAfter: 4 }),
      makeSession(idFor('2025-01-01T09:00:00Z'), { moodBefore: 9, moodAfter: 3 }),
      makeSession(idFor('2025-01-02T09:00:00Z'), { moodBefore: 7, moodAfter: 7 }),
    ]);

    expect(stats.total).toBe(3);
    expect(stats.points.map((point) => point.before)).toEqual([9, 7, 5]);
    expect(stats.points.map((point) => point.delta)).toEqual([6, 0, 1]);
    expect(stats.averageBefore).toBe(7);
    expect(stats.averageAfter).toBe(4.7);
    expect(stats.averageDelta).toBe(2.3);
    expect(stats.improved).toBe(2);
    expect(stats.unchanged).toBe(1);
    expect(stats.worsened).toBe(0);
  });

  it('counts cases where it became harder', () => {
    const stats = getMoodStats([
      makeSession(idFor('2025-04-01T09:00:00Z'), { moodBefore: 3, moodAfter: 6 }),
    ]);

    expect(stats.worsened).toBe(1);
    expect(stats.improved).toBe(0);
    expect(stats.averageDelta).toBe(-3);
    expect(stats.points[0].delta).toBe(-3);
  });
});
