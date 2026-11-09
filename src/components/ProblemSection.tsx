import { ChevronDown } from 'lucide-react';

interface ProblemSectionProps {
  projectUrl: string;
}

export default function ProblemSection({ projectUrl }: ProblemSectionProps) {
  return (
    <section
      className="h-screen w-full flex flex-col items-center justify-center text-center bg-calm-sage-50 dark:bg-calm-sage-900/90"
    >
      <div className="px-6 sm:px-12 py-8">
        <div className="mb-8 animate-bounce">
          <ChevronDown className="h-12 w-12 text-calm-sage-800 dark:text-calm-sage-200" aria-hidden="true" />
        </div>
        <h2
          className="text-3xl font-bold text-calm-sage-800 dark:text-calm-sage-200 sm:text-4xl mb-4 leading-tight"
        >
          Ваша проблема
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400 sm:text-xl max-w-lg mx-auto mb-8">
          Якщо ви відчуваєте вивчену безпорадність, перейдіть до нашого проекту,
          де допоможемо повернути контроль над своїм життям.
        </p>
        <a
          href={projectUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-calm-sage-800 px-6 py-3 text-sm font-bold text-black transition-all duration-300 hover:bg-calm-sage-900 hover:scale-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-calm-sage-300 dark:bg-calm-sage-200 dark:text-black dark:hover:bg-calm-sage-300"
        >
          <span aria-hidden="true"> →</span>
        </a>
      </div>
    </section>
  );
}
