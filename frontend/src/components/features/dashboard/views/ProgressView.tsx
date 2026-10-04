import { useLanguage } from '../../../../hooks/useLanguage';
import { AdvancedStats, ProgressChart } from '../Charts';
import { WeightTracker } from '../WeightTracker';
import { ViewHeader } from '../DashboardLayout';
import type { AsyncState } from '../../../../hooks/useAsync';
import type { MuscleVolume, WeeklyProgress } from '../../../../types';

interface ProgressViewProps {
  progressQuery: AsyncState<WeeklyProgress[]>;
  volumeQuery: AsyncState<MuscleVolume[]>;
  locked: boolean;
}

export function ProgressView({ progressQuery, volumeQuery, locked }: ProgressViewProps) {
  const { t } = useLanguage();

  return (
    <div className="min-w-0 space-y-8 sm:space-y-10">
      <ViewHeader title={t.dashboard.progress.title} subtitle={t.dashboard.progress.subtitle} />
      <div className="grid min-w-0 gap-6 sm:gap-8 xl:grid-cols-2">
        <div className="min-w-0">
          <ProgressChart data={progressQuery.data} loading={progressQuery.loading} error={progressQuery.error} onRetry={progressQuery.refetch} />
        </div>
        <div className="min-w-0">
          <WeightTracker />
        </div>
      </div>
      <div className="min-w-0">
        <AdvancedStats locked={locked} data={volumeQuery.data} loading={volumeQuery.loading} />
      </div>
    </div>
  );
}