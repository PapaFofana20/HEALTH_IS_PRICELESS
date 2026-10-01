import { useState } from 'react';
import { SearchX, Sparkles } from 'lucide-react';
import { useLanguage, usePageTitle } from '../hooks/useLanguage';
import { useAsync } from '../hooks/useAsync';
import { api } from '../services/api';
import { ExerciseCard, ExerciseDetail } from '../components/features/exercises/ExerciseCard';
import { Tag } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { PageHero, container } from '../components/ui/SectionHeading';
import { EmptyState, ErrorState, GridSkeleton } from '../components/ui/States';
import type { Exercise } from '../types';

export default function ExercisesPage() {
  const { t, loc } = useLanguage();
  usePageTitle(t.nav.exercises);
  const { data, loading, error, refetch } = useAsync(() => api.getExercises(), []);
  const [selected, setSelected] = useState<Exercise | null>(null);

  const list = data ?? [];

  return (
    <>
      <PageHero
        eyebrow={t.exercisesPage.eyebrow}
        title={
          <>
            {t.exercisesPage.title1} <span className="text-volt">{t.exercisesPage.title2}</span>
          </>
        }
        subtitle={t.exercisesPage.subtitle}
      >
        <Tag tone="volt" icon={<Sparkles className="h-3 w-3" aria-hidden />} className="px-3 py-1.5 text-[11px]">
          {t.exercisesPage.freeBadge}
        </Tag>
      </PageHero>

      <section className="py-10 lg:py-14">
        <div className={container}>
          <p aria-live="polite" className="text-sm font-semibold text-muted">
            {loading ? t.common.loading : t.exercisesPage.count(list.length)}
          </p>

          <div className="mt-6">
            {loading ? (
              <GridSkeleton count={8} className="lg:grid-cols-4" />
            ) : error ? (
              <ErrorState title={t.exercisesPage.errorTitle} onRetry={refetch} />
            ) : list.length === 0 ? (
              <EmptyState icon={<SearchX aria-hidden />} title={t.exercisesPage.emptyTitle} text={t.exercisesPage.emptyText} />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {list.map((exercise) => (
                  <ExerciseCard key={exercise.id} exercise={exercise} onOpen={setSelected} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <Modal open={selected !== null} onClose={() => setSelected(null)} title={selected ? loc(selected.name) : ''}>
        {selected && <ExerciseDetail exercise={selected} />}
      </Modal>
    </>
  );
}
