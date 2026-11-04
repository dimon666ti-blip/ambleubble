import { afterEach, describe, expect, it, vi } from 'vitest';
import { generateAdvice } from '@/lib/advice';

const baseRequest = {
  situation: 'Я боюся поговорити з керівником про свої потреби',
  emotion: 'helpless' as const,
  difficulty: 'easy' as const,
  apiKey: '',
  model: 'openai/gpt-4o-mini',
};

describe('generateAdvice', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns mock advice when no API key is provided', async () => {
    const advice = await generateAdvice(baseRequest);

    expect(advice.source).toBe('mock');
    expect(advice.steps).toHaveLength(3);
    expect(advice.steps.every((step) => step.minutes >= 1 && step.minutes <= 10)).toBe(true);
  });

  it('parses and clamps a valid AI response', async () => {
    const payload = {
      analysis: 'Це тестовий AI-аналіз.',
      canControl: ['Свій наступний крок'],
      cannotControl: ['Слова інших'],
      questions: ['Що я можу зробити прямо зараз?'],
      keyThemes: ['Страх', 'Невпевненість'],
      underlyingNeed: 'Потреба в безпеці',
      steps: [
        { title: 'Крок один', description: 'Опис', minutes: 2 },
        { title: 'Крок два', description: 'Опис', minutes: 5 },
        { title: 'Крок три', description: 'Опис', minutes: 12 },
      ],
    };

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(payload) } }] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );

    const advice = await generateAdvice({ ...baseRequest, apiKey: 'sk-or-test' });

    expect(advice.source).toBe('ai');
    expect(advice.analysis).toBe(payload.analysis);
    expect(advice.steps.map((step) => step.minutes)).toEqual([2, 5, 10]);
    expect(advice.steps.every((step) => step.id.startsWith('step-'))).toBe(true);
  });

  it('falls back to mock advice when the API responds with an error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('server error', { status: 500 })));

    const advice = await generateAdvice({ ...baseRequest, apiKey: 'sk-or-test' });

    expect(advice.source).toBe('mock');
    expect(advice.steps).toHaveLength(3);
  });

  it('falls back to mock advice when the AI response is malformed', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ choices: [{ message: { content: '{not json' } }] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );

    const advice = await generateAdvice({ ...baseRequest, apiKey: 'sk-or-test' });

    expect(advice.source).toBe('mock');
  });

  it('sends the configured model and authorization header', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({
        analysis: 'ok',
        canControl: ['a'],
        cannotControl: ['b'],
        questions: ['q1', 'q2'],
        keyThemes: ['t1'],
        underlyingNeed: 'need',
        steps: [
          { title: '1', description: 'd', minutes: 1 },
          { title: '2', description: 'd', minutes: 1 },
          { title: '3', description: 'd', minutes: 1 },
        ],
      }) } }] }), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await generateAdvice({ ...baseRequest, apiKey: 'secret-key', model: 'xingchen-agi/xing4.0-29b-a4b:free' });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('https://openrouter.ai/api/v1/chat/completions');
    expect(options.method).toBe('POST');
    expect(options.headers.Authorization).toBe('Bearer secret-key');
    expect(JSON.parse(options.body).model).toBe('xingchen-agi/xing4.0-29b-a4b:free');
  });
});
