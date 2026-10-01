import { useState } from 'react';
import { SearchX } from 'lucide-react';
import { useLanguage } from '../../../../hooks/useLanguage';
import { useAsync } from '../../../../hooks/useAsync';
import { api } from '../../../../services/api';
import { ExerciseCard, ExerciseDetail } from '../../exercises/ExerciseCard';
import { Modal } from '../../../ui/Modal';
import { EmptyState, ErrorState, GridSkeleton } from '../../../ui/States';
import { ViewHeader } from '../DashboardLayout';
import type { Exercise } from '../../../../types';

export function ExercisesView() {
  const { t, loc } = useLanguage();
  const { data, loading, error, refetch } = useAsync(() => api.getExercises(), []);
  const [selected, setSelected] = useState<Exercise | null>(null);

  const list = data ?? [];

  return (
    <div>
      <ViewHeader title={t.dashboard.exercises.title} subtitle={t.dashboard.exercises.subtitle} />

      <p aria-live="polite" className="text-sm font-semibold text-muted">
        {loading ? t.common.loading : t.exercisesPage.count(list.length)}
      </p>

      <div className="mt-6">
        {loading ? (
          <GridSkeleton count={8} className="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" />
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

      <Modal open={selected !== null} onClose={() => setSelected(null)} title={selected ? loc(selected.name) : ''}>
        {selected && <ExerciseDetail exercise={selected} />}
      </Modal>
    </div>
  );
}
