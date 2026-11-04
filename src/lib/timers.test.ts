import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearTimersForSession, loadTimer, saveTimer } from '@/lib/timers';

describe('timers', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-02T10:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    window.localStorage.clear();
  });

  it('returns an idle timer when nothing is stored', () => {
    expect(loadTimer('session-1:step-1', 300)).toEqual({ status: 'idle', remaining: 300 });
  });

  it('persists paused timers exactly', () => {
    saveTimer('session-1:step-1', 'paused', 125);
    expect(loadTimer('session-1:step-1', 300)).toEqual({ status: 'paused', remaining: 125 });
  });

  it('subtracts elapsed time from a running timer', () => {
    saveTimer('session-1:step-1', 'running', 100);

    vi.setSystemTime(new Date('2026-11-02T10:00:40.000Z'));

    expect(loadTimer('session-1:step-1', 300)).toEqual({ status: 'running', remaining: 60 });
  });

  it('marks a running timer as finished when time runs out', () => {
    saveTimer('session-1:step-1', 'running', 10);

    vi.setSystemTime(new Date('2026-11-02T10:00:20.000Z'));

    expect(loadTimer('session-1:step-1', 300)).toEqual({ status: 'finished', remaining: 0 });
  });

  it('clears only timers for the requested session', () => {
    saveTimer('session-1:step-1', 'paused', 10);
    saveTimer('session-2:step-1', 'paused', 20);

    clearTimersForSession('session-1');

    expect(loadTimer('session-1:step-1', 300)).toEqual({ status: 'idle', remaining: 300 });
    expect(loadTimer('session-2:step-1', 300)).toEqual({ status: 'paused', remaining: 20 });
  });
});
