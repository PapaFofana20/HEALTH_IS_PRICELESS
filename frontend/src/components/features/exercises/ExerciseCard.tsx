import { ArrowRight, CircleCheck, Dumbbell, Info, Repeat, TriangleAlert } from 'lucide-react';
import { useLanguage } from '../../../hooks/useLanguage';
import { Tag } from '../../ui/Badge';
import type { Exercise } from '../../../types';

export function ExerciseCard({ exercise, onOpen }: { exercise: Exercise; onOpen: (exercise: Exercise) => void }) {
  const { t, loc } = useLanguage();
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-edge bg-night-800 transition-all duration-300 hover:-translate-y-1 hover:border-edge-strong hover:shadow-2xl hover:shadow-black/40 has-[button:focus-visible]:ring-2 has-[button:focus-visible]:ring-volt">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={exercise.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
        <div aria-hidden className="absolute inset-0 bg-linear-to-t from-night-800 via-transparent to-transparent" />
        <Tag tone="light" className="absolute left-3 top-3">
          {t.levels[exercise.level]}
        </Tag>
        <Tag tone="volt" className="absolute right-3 top-3 bg-night-900/75">
          {t.trainingTypes[exercise.type]}
        </Tag>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-volt">{t.muscles[exercise.muscleGroup]}</p>
        <h3 className="mt-2 font-display text-2xl uppercase leading-tight tracking-wide">{loc(exercise.name)}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{loc(exercise.description)}</p>
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-edge pt-4 text-xs font-semibold text-ink/85">
          <li className="flex items-center gap-1.5">
            <Repeat className="h-3.5 w-3.5 text-muted" aria-hidden />
            {loc(exercise.prescription)}
          </li>
          <li className="flex items-center gap-1.5">
            <Dumbbell className="h-3.5 w-3.5 text-muted" aria-hidden />
            {t.equipment[exercise.equipment]}
          </li>
        </ul>
        <button
          type="button"
          onClick={() => onOpen(exercise)}
          className="mt-auto inline-flex items-center gap-2 pt-5 text-left text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink outline-none transition-colors duration-200 after:absolute after:inset-0 after:content-[''] group-hover:text-volt"
        >
          {t.exercisesPage.viewInstructions}
          <span className="sr-only"> — {loc(exercise.name)}</span>
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
        </button>
      </div>
    </article>
  );
}

/** Detailed instructions, rendered inside a Modal. */
export function ExerciseDetail({ exercise }: { exercise: Exercise }) {
  const { t, loc } = useLanguage();
  return (
    <div>
      <div className="relative -mx-5 -mt-5 mb-6 aspect-[16/8] overflow-hidden sm:-mx-6 sm:-mt-6">
        <img src={exercise.image} alt={loc(exercise.name)} className="h-full w-full object-cover" />
        <div aria-hidden className="absolute inset-0 bg-linear-to-t from-night-800 via-night-800/20 to-transparent" />
        <div className="absolute bottom-4 left-5 flex flex-wrap gap-2 sm:left-6">
          <Tag tone="volt" className="bg-night-900/75">
            {t.muscles[exercise.muscleGroup]}
          </Tag>
          <Tag tone="light">{t.levels[exercise.level]}</Tag>
          <Tag tone="light">{t.trainingTypes[exercise.type]}</Tag>
        </div>
      </div>

      <p className="text-base leading-relaxed text-ink/90">{loc(exercise.description)}</p>

      <div className="mt-6 overflow-hidden rounded-xl border border-edge bg-night-900">
        <div className="aspect-video w-full">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${exercise.videoId}`}
            title={`${loc(exercise.name)} — ${t.exercisesPage.videoTitle}`}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
        <div className="flex items-center justify-between gap-3 p-4">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-muted">{t.exercisesPage.videoTitle}</p>
          <a
            href={`https://www.youtube.com/watch?v=${exercise.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-volt underline-offset-4 hover:underline"
          >
            {t.exercisesPage.videoLink}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </a>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-edge bg-night-900 p-4">
          <dt className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">{t.exercisesPage.prescription}</dt>
          <dd className="mt-1 font-display text-2xl text-volt">{loc(exercise.prescription)}</dd>
        </div>
        <div className="rounded-lg border border-edge bg-night-900 p-4">
          <dt className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">{t.exercisesPage.equipment}</dt>
          <dd className="mt-1 font-display text-2xl uppercase">{t.equipment[exercise.equipment]}</dd>
        </div>
      </dl>

      <h3 className="mt-8 font-display text-xl uppercase tracking-wide">{t.exercisesPage.steps}</h3>
      <ol className="mt-4 space-y-3">
        {loc(exercise.steps).map((step, index) => (
          <li key={step} className="flex gap-4">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-volt font-display text-sm text-night-900">{index + 1}</span>
            <p className="pt-0.5 text-sm leading-relaxed text-ink/90">{step}</p>
          </li>
        ))}
      </ol>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-edge bg-night-900 p-5">
          <h3 className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-success">
            <CircleCheck className="h-4 w-4" aria-hidden />
            {t.exercisesPage.tips}
          </h3>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink/85">
            {loc(exercise.tips).map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-edge bg-night-900 p-5">
          <h3 className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-danger">
            <TriangleAlert className="h-4 w-4" aria-hidden />
            {t.exercisesPage.mistakes}
          </h3>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink/85">
            {loc(exercise.mistakes).map((mistake) => (
              <li key={mistake}>{mistake}</li>
            ))}
          </ul>
        </div>
      </div>

      {exercise.secondaryMuscles.length > 0 && (
        <div className="mt-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">{t.exercisesPage.secondary}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {exercise.secondaryMuscles.map((muscle) => (
              <Tag key={muscle}>{t.muscles[muscle]}</Tag>
            ))}
          </div>
        </div>
      )}

      <p className="mt-6 flex items-start gap-2 text-xs text-muted">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        {t.exercisesPage.safety}
      </p>
    </div>
  );
}
