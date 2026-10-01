import { Bookmark } from 'lucide-react';
import { useLanguage } from '../../../../hooks/useLanguage';
import { ButtonLink } from '../../../ui/Button';
import { PlanShowcaseCard } from '../PlanShowcaseCard';
import { ViewHeader } from '../DashboardLayout';

export function ProgramsView() {
  const { t } = useLanguage();

  return (
    <div>
      <ViewHeader
        title={t.dashboard.programs.title}
        subtitle={t.dashboard.programs.subtitle}
        action={
          <ButtonLink to="/dashboard/favoris" variant="outline" size="sm" icon={<Bookmark />}>
            {t.dashboard.programs.favorites}
          </ButtonLink>
        }
      />
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <PlanShowcaseCard plan="standard" variant="full" />
        <PlanShowcaseCard plan="premium" variant="full" />
      </div>
      <p className="mt-6 text-center text-xs font-semibold text-muted">{t.plans.note}</p>
    </div>
  );
}
