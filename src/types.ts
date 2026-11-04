export type Emotion = 'uncertain' | 'helpless' | 'hopeless';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface SituationInput {
  situation: string;
  emotion: Emotion;
  difficulty: Difficulty;
  /** How hard the situation feels right now, 1 (easy) to 10 (very hard). */
  moodBefore?: number | null;
}

export interface Step {
  id: string;
  title: string;
  description: string;
  minutes: number;
}

export interface Advice {
  analysis: string;
  keyThemes: string[];
  underlyingNeed: string;
  canControl: string[];
  cannotControl: string[];
  questions: string[];
  steps: Step[];
  source: 'ai' | 'mock';
}

export interface Session extends SituationInput {
  id: string;
  advice: Advice;
  completedStepIds: string[];
  reflection?: string;
  /** How hard the situation feels after taking the steps, 1 (easy) to 10 (very hard). */
  moodAfter?: number | null;
  moodUpdatedAt?: string;
}

export interface Win {
  id: string;
  situation: string;
  stepTitle: string;
  completedAt: string;
}
