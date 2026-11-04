import type { Difficulty, Emotion } from '@/types';

export const AI_MODEL_OPTIONS: { value: string; label: string; hint: string }[] = [
  { value: 'xingchen-agi/xing4.0-29b-a4b:free', label: 'Xing4.0 29B A4B (free)', hint: 'Безкоштовна, швидка (рекомендовано)' },
  { value: 'nvidia/nemotron-3.5-super-vl', label: 'Nemotron 3.5 Super VL', hint: 'Потужна мультимодальна модель NVIDIA' },
  { value: 'openai/gpt-4o-mini', label: 'GPT-4o mini', hint: 'Лаконічні та чіткі відповіді' },
  { value: 'anthropic/claude-3.5-haiku', label: 'Claude 3.5 Haiku', hint: 'Теплий і уважний тон' },
];

export const DEFAULT_MODEL = 'xingchen-agi/xing4.0-29b-a4b:free';
export const MIN_SITUATION_LENGTH = 3;
export const MAX_SITUATION_LENGTH = 500;
export const PROGRESS_BY_COMPLETED = [0, 33, 66, 100] as const;

export const EMOTION_OPTIONS: { value: Emotion; label: string; emoji: string }[] = [
  { value: 'uncertain', label: 'Невпевненість', emoji: '😐' },
  { value: 'helpless', label: 'Відчуття безсилля', emoji: '😟' },
  { value: 'hopeless', label: 'Втрата віри у власні сили', emoji: '😔' },
];

export const DIFFICULTY_OPTIONS: { value: Difficulty; label: string }[] = [
  { value: 'easy', label: 'Легка' },
  { value: 'medium', label: 'Середня' },
  { value: 'hard', label: 'Висока' },
];

export const THEME_OPTIONS: { value: Theme; label: string; hint: string }[] = [
  { value: 'system', label: 'Системна', hint: 'Як у налаштуваннях пристрою' },
  { value: 'light', label: 'Світла', hint: 'Яскрава і легка' },
  { value: 'dark', label: 'Темна', hint: 'Для вечірнього використання' },
];

export type Theme = 'light' | 'dark' | 'system';

export const EMPTY_SITUATION_INPUT = {
  situation: '',
  emotion: 'helpless',
  difficulty: 'easy',
  moodBefore: null,
} as const;

export const SITUATION_EXAMPLES = [
  'Мені складно почати роботу над важливим проєктом',
  'Я боюся поговорити з керівником про свої потреби',
  'У мене багато справ, і я не знаю, за що взятися',
  'Я відчуваю, що не встигаю по всіх фронтах',
  'Мені важко відмовити, коли просять про послугу',
  'Я боюся, що моя робота недостатньо хороша',
];
