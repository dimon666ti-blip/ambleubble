import { DIFFICULTY_OPTIONS, EMOTION_OPTIONS } from '@/lib/constants';
import { buildMockAdvice } from '@/lib/mockAdvice';
import type { Advice, Difficulty, Emotion, Step } from '@/types';

interface AdviceRequest {
  situation: string;
  emotion: Emotion;
  difficulty: Difficulty;
  apiKey: string;
  model: string;
}

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const REQUEST_TIMEOUT_MS = 25000;

const SYSTEM_PROMPT = `Ти — турботливий коуч, який допомагає людям подолати відчуття безсилля.
Ти ніколи не критикуєш людину і не знецінюєш її переживання.
Проаналізуй текст ситуації уважно: виокреми конкретні деталі, емоції, приховані потреби і патерни, а не давай загальні фрази.
Допоможи визначити, що людина може контролювати, а що ні.
Склади рівно 3 прості, реалістичні практичні кроки, кожен тривалістю від 1 до 10 хвилин.
Кроки мають поступово відновлювати віру у власні сили: від простішого до складнішого.
Зроби кроки різноманітними: поєднуй тілесні, емоційні, соціальні та практичні дії, не повторюй один і той самий тип.
Аналіз і списки контролю/неконтролю мають бути конкретними для цієї ситуації, а не шаблонними.
Додай 2-3 питання для роздумів, які допоможуть людині самій знайти відповіді і глибше зрозуміти ситуацію. Питання мають бути відкритими, без очевидної відповіді, і стосуватися саме її ситуації.
Відповідай лише JSON українською мовою без жодного іншого тексту у форматі:
{"analysis": "короткий аналіз ситуації та емоцій", "keyThemes": ["2-4 ключові теми/патерни, помічені в тексті"], "underlyingNeed": "яка прихована потреба стоїть за ситуацією", "canControl": ["3-4 пункти"], "cannotControl": ["3-4 пункти"], "questions": ["2-3 питання для роздумів"], "steps": [{"title": "назва кроку", "description": "що саме зробити", "minutes": 5}]}`;

const DIFFICULTY_HINTS: Record<Difficulty, string> = {
  easy: 'дуже прості кроки, які можна зробити за одну-дві хвилини',
  medium: 'помірні кроки, що потребують трохи зусиль',
  hard: 'сміливіші кроки, але все ще невеликі й реалістичні',
};

export async function generateAdvice(request: AdviceRequest): Promise<Advice> {
  if (!request.apiKey.trim()) {
    return buildMockAdvice(request);
  }

  try {
    const advice = await requestAiAdvice(request);
    return advice ?? buildMockAdvice(request);
  } catch {
    return buildMockAdvice(request);
  }
}

async function requestAiAdvice({ situation, emotion, difficulty, apiKey, model }: AdviceRequest): Promise<Advice | null> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const emotionLabel = EMOTION_OPTIONS.find((option) => option.value === emotion)?.label ?? '';
  const difficultyLabel = DIFFICULTY_OPTIONS.find((option) => option.value === difficulty)?.label ?? '';
  const userPrompt = `Ситуація: ${situation}
Емоційний стан: ${emotionLabel}
Бажана складність (${difficultyLabel}): ${DIFFICULTY_HINTS[difficulty]}`;

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`,
        'X-Title': 'I CAN',
      },
      body: JSON.stringify({
        model,
        temperature: 0.7,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!response.ok) return null;

    const data: unknown = await response.json();
    const content = extractContent(data);
    return content ? parseAdvice(content) : null;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function extractContent(data: unknown): string | null {
  const choices = (data as { choices?: { message?: { content?: unknown } }[] } | null)?.choices;
  const content = choices?.[0]?.message?.content;
  return typeof content === 'string' ? content : null;
}

function parseAdvice(text: string): Advice | null {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end <= start) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }

  const candidate = parsed as {
    analysis?: unknown;
    keyThemes?: unknown;
    underlyingNeed?: unknown;
    canControl?: unknown;
    cannotControl?: unknown;
    questions?: unknown;
    steps?: unknown;
  };

  if (
    typeof candidate.analysis !== 'string' ||
    !isNonEmptyStringArray(candidate.keyThemes) ||
    typeof candidate.underlyingNeed !== 'string' ||
    !isNonEmptyStringArray(candidate.canControl) ||
    !isNonEmptyStringArray(candidate.cannotControl) ||
    !isNonEmptyStringArray(candidate.questions) ||
    !Array.isArray(candidate.steps) ||
    candidate.steps.length !== 3
  ) {
    return null;
  }

  const steps: Step[] = [];
  for (const [index, raw] of candidate.steps.entries()) {
    const step = parseStep(raw, index);
    if (!step) return null;
    steps.push(step);
  }

  return {
    analysis: candidate.analysis,
    keyThemes: candidate.keyThemes,
    underlyingNeed: candidate.underlyingNeed,
    canControl: candidate.canControl,
    cannotControl: candidate.cannotControl,
    questions: candidate.questions,
    steps,
    source: 'ai',
  };
}

function parseStep(raw: unknown, index: number): Step | null {
  const candidate = raw as { title?: unknown; description?: unknown; minutes?: unknown } | null;
  if (typeof candidate?.title !== 'string' || typeof candidate.description !== 'string') return null;

  const minutes =
    typeof candidate.minutes === 'number' ? Math.min(10, Math.max(1, Math.round(candidate.minutes))) : 5;

  return { id: `step-${index + 1}`, title: candidate.title, description: candidate.description, minutes };
}

function isNonEmptyStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === 'string');
}
