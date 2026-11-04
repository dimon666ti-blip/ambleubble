import { Activity } from 'lucide-react';
import { getMoodStats, type MoodPoint } from '@/lib/mood';
import type { Session } from '@/types';

interface MoodChartProps {
  sessions: Session[];
}

const CHART_WIDTH = 640;
const CHART_HEIGHT = 260;
const PADDING = { top: 24, right: 24, bottom: 38, left: 36 };
const MAX_POINTS = 12;
const GRID_VALUES = [10, 7, 4, 1];

const numberFormatter = new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 1 });

function formatAverage(value: number | null): string {
  if (value === null) return '—';
  return numberFormatter.format(value);
}

function formatDelta(value: number): string {
  if (value > 0) return `+${numberFormatter.format(value)}`;
  if (value < 0) return `−${numberFormatter.format(Math.abs(value))}`;
  return '0';
}

function deltaLabel(point: MoodPoint): string {
  if (point.delta > 0) return `легше на ${point.delta}`;
  if (point.delta < 0) return `важче на ${Math.abs(point.delta)}`;
  return 'без змін';
}

function deltaClasses(point: MoodPoint): string {
  if (point.delta > 0) return 'bg-calm-mint-100 text-calm-mint-800 dark:bg-emerald-900/40 dark:text-calm-mint-200';
  if (point.delta < 0) return 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200';
  return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-white';
}

export default function MoodChart({ sessions }: MoodChartProps) {
  const stats = getMoodStats(sessions);
  const visible = stats.points.slice(-MAX_POINTS);
  const plotWidth = CHART_WIDTH - PADDING.left - PADDING.right;
  const plotHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;

  const slotX = (index: number) =>
    visible.length === 1
      ? PADDING.left + plotWidth / 2
      : PADDING.left + (index / (visible.length - 1)) * plotWidth;
  const scaleY = (value: number) => PADDING.top + ((10 - value) / (10 - 1)) * plotHeight;
  const linePath = (key: 'before' | 'after') =>
    visible.map((point, index) => `${index === 0 ? 'M' : 'L'} ${slotX(index)} ${scaleY(point[key])}`).join(' ');
  const areaPath =
    visible.length > 1
      ? `${linePath('after')} L ${slotX(visible.length - 1)} ${PADDING.top + plotHeight} L ${slotX(0)} ${
          PADDING.top + plotHeight
        } Z`
      : '';

  const improvementShare = stats.total > 0 ? Math.round((stats.improved / stats.total) * 100) : 0;

  return (
    <section className="rounded-3xl bg-white p-6 shadow-soft sm:p-8 dark:bg-slate-800 dark:shadow-none">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Динаміка настрою</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-white">
            Від 1 (легко) до 10 (дуже важко). Чим нижче лінія, тим краще.
          </p>
        </div>
        {stats.total > 0 && (
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-white">
              <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-calm-sky-300" />
              До
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-white">
              <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-calm-mint-300" />
              Після
            </span>
          </div>
        )}
      </div>

      {stats.total === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-2xl bg-calm-sky-50 p-6 text-center dark:bg-slate-700">
          <Activity className="h-10 w-10 text-calm-sky-800 dark:text-calm-sky-300" aria-hidden="true" />
          <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-600 dark:text-white">
            Оціни свій стан до того, як почнеш кроки, і після них — і тут з’явиться графік. Так буде видно, які дії
            справді допомагають.
          </p>
        </div>
      ) : (
        <>
          <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl bg-calm-sky-50 px-4 py-3 dark:bg-slate-700">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-white">Оцінок</dt>
              <dd className="mt-1 text-xl font-bold text-slate-800 tabular-nums dark:text-white">{stats.total}</dd>
            </div>
            <div className="rounded-2xl bg-calm-sky-50 px-4 py-3 dark:bg-slate-700">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-white">Середнє до</dt>
              <dd className="mt-1 text-xl font-bold text-slate-800 tabular-nums dark:text-white">
                {formatAverage(stats.averageBefore)}
              </dd>
            </div>
            <div className="rounded-2xl bg-calm-mint-50 px-4 py-3 dark:bg-emerald-900/30">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-white">Середнє після</dt>
              <dd className="mt-1 text-xl font-bold text-slate-800 tabular-nums dark:text-white">
                {formatAverage(stats.averageAfter)}
              </dd>
            </div>
            <div className="rounded-2xl bg-calm-lavender-50 px-4 py-3 dark:bg-slate-700">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-white">Полегшення</dt>
              <dd
                className={`mt-1 text-xl font-bold tabular-nums ${
                  (stats.averageDelta ?? 0) > 0
                    ? 'text-calm-mint-800 dark:text-calm-mint-200'
                    : (stats.averageDelta ?? 0) < 0
                      ? 'text-rose-700 dark:text-rose-300'
                      : 'text-slate-800 dark:text-white'
                }`}
              >
                {stats.averageDelta === null ? '—' : formatDelta(stats.averageDelta)}
              </dd>
            </div>
          </dl>

          <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-white">
            {stats.improved > 0 ? (
              <>
                Стало легше у <strong>{stats.improved}</strong> з {stats.total} випадків ({improvementShare}%).{' '}
              </>
            ) : (
              <>Поки що поліпшень не зафіксовано — це теж корисна інформація. </>
            )}
            {stats.worsened > 0 ? `Важче стало у ${stats.worsened} — це привід спробувати інший тип кроків.` : null}
          </p>

          <figure className="mt-5">
            <div className="overflow-x-auto">
              <svg
                viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
                className="h-auto w-full min-w-[420px]"
                role="img"
                aria-label={`Графік настрою: ${stats.points
                  .map((point) => `${point.dateLabel} — до ${point.before}, після ${point.after}`)
                  .join('; ')}`}
              >
                {GRID_VALUES.map((value) => (
                  <g key={value}>
                    <line
                      x1={PADDING.left}
                      y1={scaleY(value)}
                      x2={CHART_WIDTH - PADDING.right}
                      y2={scaleY(value)}
                      stroke="currentColor"
                      className="text-slate-200 dark:text-slate-600"
                      strokeWidth={1}
                      strokeDasharray={value === 1 || value === 10 ? undefined : '4 6'}
                      opacity={value === 1 || value === 10 ? 0.9 : 0.5}
                    />
                    <text
                      x={PADDING.left - 10}
                      y={scaleY(value) + 4}
                      textAnchor="end"
                      className="fill-slate-500 text-[11px] dark:fill-slate-300"
                    >
                      {value}
                    </text>
                  </g>
                ))}

                {areaPath ? <path d={areaPath} fill="currentColor" className="text-calm-mint-200 dark:text-calm-mint-800" opacity={0.35} /> : null}

                <path
                  d={linePath('before')}
                  fill="none"
                  stroke="currentColor"
                  className="text-calm-sky-300"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d={linePath('after')}
                  fill="none"
                  stroke="currentColor"
                  className="text-calm-mint-800 dark:text-calm-mint-300"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {visible.map((point, index) => (
                  <g key={point.sessionId}>
                    <circle
                      cx={slotX(index)}
                      cy={scaleY(point.before)}
                      r={5}
                      fill="white"
                      stroke="currentColor"
                      className="text-calm-sky-300"
                      strokeWidth={2.5}
                    />
                    <circle
                      cx={slotX(index)}
                      cy={scaleY(point.after)}
                      r={5}
                      fill="currentColor"
                      stroke="white"
                      className="text-calm-mint-800 dark:text-calm-mint-300"
                      strokeWidth={2}
                    />
                    {(visible.length <= 6 || index % 2 === 0 || index === visible.length - 1) && (
                      <text
                        x={slotX(index)}
                        y={CHART_HEIGHT - 12}
                        textAnchor="middle"
                        className="fill-slate-500 text-[11px] dark:fill-slate-300"
                      >
                        {point.dateLabel}
                      </text>
                    )}
                  </g>
                ))}
              </svg>
            </div>
          </figure>

          <ul className="mt-5 space-y-2">
            {[...stats.points].slice(-5).reverse().map((point) => (
              <li
                key={point.sessionId}
                className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700"
              >
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-semibold text-slate-800 dark:text-white">{point.situation}</p>
                  <p className="mt-0.5 text-xs font-semibold text-slate-500 dark:text-white">{point.dateLabel}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="font-mono text-sm font-bold tabular-nums text-slate-700 dark:text-white">
                    {point.before} → {point.after}
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${deltaClasses(point)}`}>
                    {deltaLabel(point)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
