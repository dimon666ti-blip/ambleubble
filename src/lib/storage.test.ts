import { afterEach, describe, expect, it } from 'vitest';
import { loadAiModel, loadApiKey, loadSession, loadWins, saveAiModel, saveApiKey, saveSession, saveWins } from '@/lib/storage';
import { AI_MODEL_OPTIONS, DEFAULT_MODEL } from '@/lib/constants';

describe('storage', () => {
  afterEach(() => {
    window.window.localStorage.clear();
  });

  it('persists and removes the API key', () => {
    saveApiKey('sk-or-secret');
    expect(loadApiKey()).toBe('sk-or-secret');

    saveApiKey('');
    expect(loadApiKey()).toBe('');
    expect(window.localStorage.getItem('ican.openrouterApiKey')).toBeNull();
  });

  it('falls back to the default model for unknown values', () => {
    window.localStorage.setItem('ican.aiModel', 'unknown/model');
    expect(loadAiModel()).toBe(DEFAULT_MODEL);

    saveAiModel(AI_MODEL_OPTIONS[1].value);
    expect(loadAiModel()).toBe(AI_MODEL_OPTIONS[1].value);
  });

  it('persists a valid session and ignores malformed data', () => {
    const session = {
      id: 'session-1',
      situation: 'Test situation',
      emotion: 'helpless' as const,
      difficulty: 'medium' as const,
      advice: {
        analysis: 'analysis',
        canControl: ['a'],
        cannotControl: ['b'],
        questions: ['q'],
        keyThemes: ['theme'],
        underlyingNeed: 'need',
        steps: [{ id: 'step-1', title: 'Step', description: 'Desc', minutes: 3 }],
        source: 'mock' as const,
      },
      completedStepIds: ['step-1'],
    };

    saveSession(session);
    expect(loadSession()).toEqual(session);

    window.localStorage.setItem('ican.sessions', JSON.stringify([{ id: 'broken' }]));
    window.localStorage.removeItem('ican.activeSessionId');
    expect(loadSession()).toBeNull();
  });

  it('persists wins and returns an empty array for invalid JSON', () => {
    const wins = [
      { id: 'w-1', situation: 'Situation', stepTitle: 'Step', completedAt: new Date().toISOString() },
    ];

    saveWins(wins);
    expect(loadWins()).toEqual(wins);

    window.localStorage.setItem('ican.wins', '{bad json');
    expect(loadWins()).toEqual([]);
  });
});
