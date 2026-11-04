import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Check, Eye, EyeOff, X } from 'lucide-react';
import { AI_MODEL_OPTIONS, THEME_OPTIONS } from '@/lib/constants';

interface SettingsModalProps {
  apiKey: string;
  model: string;
  theme: string;
  onClose: () => void;
  onSave: (apiKey: string, model: string, theme: string) => void;
}

export default function SettingsModal({ apiKey, model, theme, onClose, onSave }: SettingsModalProps) {
  const [draftKey, setDraftKey] = useState(apiKey);
  const [draftModel, setDraftModel] = useState(model);
  const [draftTheme, setDraftTheme] = useState(theme);
  const [isVisible, setIsVisible] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const getFocusableElements = () =>
      Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );

    const focusableElements = getFocusableElements();

    const preferredElement =
      focusableElements.find((element) => element.matches('input, textarea, select')) ??
      focusableElements[0] ??
      dialog;
    preferredElement.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;

      const elements = getFocusableElements();
      if (elements.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const firstElement = elements[0];
      const lastElement = elements[elements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey) {
        if (activeElement === firstElement || activeElement === dialog) {
          event.preventDefault();
          lastElement.focus();
        }
        return;
      }

      if (activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocusedRef.current?.focus();
    };
  }, [onClose]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave(draftKey.trim(), draftModel, draftTheme);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/30 p-0 backdrop-blur-sm animate-fade-in sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        aria-describedby="settings-description"
        tabIndex={-1}
        className="flex max-h-[90vh] w-full max-w-md flex-col rounded-t-3xl bg-white shadow-soft animate-pop-in focus:outline-none sm:rounded-3xl dark:bg-slate-800"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 p-6 pb-4">
          <div>
            <h2 id="settings-title" className="text-xl font-bold text-slate-800 dark:text-white">
              Налаштування
            </h2>
            <p id="settings-description" className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-white">
              Ключ OpenRouter допоможе AI підібрати кроки саме для тебе. Він зберігається лише у твоєму браузері.
              Без ключа застосунок використає базові поради.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрити"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 dark:text-white transition-colors hover:bg-calm-lavender-100 hover:text-slate-800 dark:text-white"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 pb-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-white">OpenRouter API Key</span>
              <div className="relative">
                <input
                  type={isVisible ? 'text' : 'password'}
                  value={draftKey}
                  onChange={(event) => setDraftKey(event.target.value)}
                  placeholder="sk-or-..."
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full rounded-2xl border border-slate-200 bg-calm-white py-3 pl-4 pr-12 text-slate-800 dark:text-white transition-colors placeholder:text-slate-400 focus:border-calm-sky-300 focus:outline-none focus:ring-4 focus:ring-calm-sky-100 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-400 dark:border-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setIsVisible((value) => !value)}
                  aria-label={isVisible ? 'Приховати ключ' : 'Показати ключ'}
                  className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-slate-500 dark:text-white transition-colors hover:bg-calm-sky-100"
                >
                  {isVisible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>
            </label>

            <fieldset>
              <legend className="mb-3 text-sm font-semibold text-slate-700 dark:text-white">Модель штучного інтелекту</legend>
              <div className="space-y-2" role="radiogroup" aria-label="Модель штучного інтелекту">
                {AI_MODEL_OPTIONS.map((option) => {
                  const isSelected = draftModel === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setDraftModel(option.value)}
                      className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all duration-300 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-calm-sky-100 ${
                        isSelected
                          ? 'border-calm-sky-300 bg-calm-sky-100 shadow-soft-sm'
                          : 'border-slate-200 bg-white hover:border-calm-lavender-200 hover:bg-calm-lavender-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                          isSelected ? 'border-calm-sky-800 bg-calm-sky-800 text-white' : 'border-slate-300 text-transparent'
                        }`}
                        aria-hidden="true"
                      >
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-bold text-slate-800 dark:text-white">{option.label}</span>
                        <span className="block text-sm text-slate-600">{option.hint}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-3 text-sm font-semibold text-slate-700 dark:text-white">Тема оформлення</legend>
              <div className="grid grid-cols-3 gap-2 rounded-2xl bg-calm-lavender-100 p-1.5">
                {THEME_OPTIONS.map((option) => {
                  const isSelected = draftTheme === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setDraftTheme(option.value)}
                      className={`rounded-xl py-3 text-sm font-semibold transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-calm-sky-200 ${
                        isSelected ? 'bg-white text-slate-900 shadow-soft-sm' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </div>

          <div className="flex flex-col-reverse gap-3 p-6 pt-4 sm:flex-row sm:justify-end">
            {apiKey && (
              <button
                type="button"
                onClick={() => onSave('', draftModel, draftTheme)}
                className="rounded-2xl px-5 py-3 font-semibold text-rose-700 transition-colors hover:bg-rose-50"
              >
                Видалити ключ
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl bg-slate-100 px-5 py-3 font-semibold text-slate-700 dark:text-white transition-colors hover:bg-slate-200"
            >
              Скасувати
            </button>
            <button
              type="submit"
              className="rounded-2xl bg-calm-sky-200 px-5 py-3 font-bold text-slate-900 shadow-soft-sm transition-all hover:-translate-y-0.5 hover:bg-calm-sky-300"
            >
              Зберегти
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
