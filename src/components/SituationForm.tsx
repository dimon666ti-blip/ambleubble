import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Loader2, Mic, MicOff, Sprout } from 'lucide-react';
import MoodScale from '@/components/MoodScale';
import { DIFFICULTY_OPTIONS, EMOTION_OPTIONS, MAX_SITUATION_LENGTH, MIN_SITUATION_LENGTH } from '@/lib/constants';
import type { SituationInput } from '@/types';

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

interface SituationFormProps {
  value: SituationInput;
  isLoading: boolean;
  onChange: (patch: Partial<SituationInput>) => void;
  onSubmit: (input: SituationInput) => void;
}

export default function SituationForm({ value, isLoading, onChange, onSubmit }: SituationFormProps) {
  const [showError, setShowError] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const trimmedLength = value.situation.trim().length;
  const showValidationError = showError && trimmedLength < MIN_SITUATION_LENGTH;

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const valueRef = useRef(value);
  valueRef.current = value;

  const speechSupported =
    typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

  const stopListening = () => {
    recognitionRef.current?.stop();
  };

  const startListening = () => {
    const Constructor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Constructor) return;

    setSpeechError(null);
    setInterimTranscript('');

    const recognition = new Constructor();
    recognition.lang = 'uk-UA';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interim = '';

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const transcript = event.results[index][0].transcript;
        if (event.results[index].isFinal) {
          finalTranscript += transcript;
        } else {
          interim += transcript;
        }
      }

      if (finalTranscript.trim()) {
        onChange({ situation: `${valueRef.current.situation} ${finalTranscript}`.trim() });
      }
      setInterimTranscript(interim.trim());
    };

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed') {
        setSpeechError('Доступ до мікрофона заборонено. Дозвольте його в налаштуваннях браузера.');
      } else if (event.error !== 'aborted' && event.error !== 'no-speech') {
        setSpeechError('Не вдалося розпізнати мову. Спробуйте ще раз.');
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setIsListening(true);
    } catch {
      setSpeechError('Не вдалося запустити диктування.');
    }
  };

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
    };
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (trimmedLength < MIN_SITUATION_LENGTH) {
      setShowError(true);
      return;
    }
    setShowError(false);
    onSubmit({ ...value, situation: value.situation.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl bg-white p-6 shadow-soft sm:p-8 dark:bg-slate-800 dark:shadow-none">
      <div>
        <label htmlFor="situation" className="block text-lg font-bold text-slate-800">
          У якій ситуації ти відчуваєш безсилля?
        </label>
        <div className="mt-2 flex min-h-6 items-center gap-3">
          {speechSupported ? (
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              aria-pressed={isListening}
              aria-label={isListening ? 'Зупинити диктування' : 'Почати диктування'}
              className="inline-flex items-center gap-2 rounded-xl bg-calm-lavender-100 px-3 py-1.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-calm-lavender-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-calm-lavender-200"
            >
              {isListening ? (
                <MicOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Mic className="h-4 w-4" aria-hidden="true" />
              )}
              {isListening ? 'Зупинити диктування' : 'Диктувати'}
            </button>
          ) : null}
          {isListening && interimTranscript ? (
            <span className="truncate text-sm italic text-slate-500">…{interimTranscript}</span>
          ) : null}
          {speechError ? (
            <p role="alert" className="text-sm font-semibold text-rose-700">{speechError}</p>
          ) : null}
        </div>

        <textarea
          id="situation"
          rows={4}
          value={value.situation}
          maxLength={MAX_SITUATION_LENGTH}
          onChange={(event) => {
            setShowError(false);
            onChange({ situation: event.target.value });
          }}
          placeholder="Опиши своїми словами, що відбувається. Ніхто, крім тебе, цього не прочитає."
          aria-invalid={showValidationError || undefined}
          aria-describedby={showValidationError ? 'situation-error' : undefined}
          className={`mt-3 w-full resize-none rounded-2xl border bg-calm-white p-4 text-base leading-relaxed text-slate-800 transition-all placeholder:text-slate-400 focus:outline-none focus:ring-4 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 ${
            showValidationError
              ? 'border-rose-300 focus:border-rose-300 focus:ring-rose-100'
              : 'border-slate-200 focus:border-calm-sky-300 focus:ring-calm-sky-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white'
          }`}
        />
        <div className="mt-2 flex min-h-5 items-start justify-between gap-3 text-sm">
          {showValidationError ? (
            <p id="situation-error" role="alert" className="font-semibold text-rose-700 animate-fade-in">
              Будь ласка, опиши свою ситуацію хоча б кількома словами, щоб я міг допомогти.
            </p>
          ) : (
            <span />
          )}
          <span className="shrink-0 text-slate-500 dark:text-white">
            {value.situation.length}/{MAX_SITUATION_LENGTH}
          </span>
        </div>
      </div>

      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-slate-700">Який у тебе емоційний стан?</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {EMOTION_OPTIONS.map((option) => {
            const isSelected = value.emotion === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onChange({ emotion: option.value })}
                className={`flex flex-col items-center gap-2 rounded-2xl border px-3 py-4 text-center text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-calm-sky-100 ${
                  isSelected
                    ? 'border-calm-sky-300 bg-calm-sky-100 text-slate-900 shadow-soft-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-calm-lavender-200 hover:bg-calm-lavender-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800'
                }`}
              >
                <span className="text-3xl leading-none" aria-hidden="true">
                  {option.emoji}
                </span>
                {option.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-slate-700">Наскільки складною здається ситуація?</legend>
        <div className="grid grid-cols-3 gap-2 rounded-2xl bg-calm-lavender-100 p-1.5">
          {DIFFICULTY_OPTIONS.map((option) => {
            const isSelected = value.difficulty === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onChange({ difficulty: option.value })}
                className={`rounded-xl py-3 text-sm font-semibold transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-calm-sky-200 ${
                  isSelected ? 'bg-white text-slate-900 shadow-soft-sm' : 'text-slate-600 hover:text-slate-900 dark:text-white dark:hover:text-white'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-slate-700 dark:text-white">
          Наскільки важко тобі зараз?
        </legend>
        <div className="rounded-2xl bg-calm-sky-50 p-4 dark:bg-slate-700">
          <MoodScale
            label="Оцінка стану (необов’язково)"
            hint="Так застосунок зможе показати, чи стало легше після кроків."
            value={value.moodBefore ?? null}
            onChange={(mood) => onChange({ moodBefore: mood })}
          />
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-3 rounded-2xl bg-calm-sky-200 px-6 py-4 text-lg font-bold text-slate-900 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:bg-calm-sky-300 hover:shadow-lg active:translate-y-0 disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0 focus:outline-none focus-visible:ring-4 focus-visible:ring-calm-sky-300 dark:bg-calm-sky-700 dark:text-white dark:hover:bg-calm-sky-600"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            Підбираю кроки для тебе...
          </>
        ) : (
          <>
            <Sprout className="h-5 w-5" aria-hidden="true" />
            Допоможи мені повернути контроль
          </>
        )}
      </button>
    </form>
  );
}
