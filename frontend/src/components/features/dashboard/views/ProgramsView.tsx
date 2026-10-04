import { Bookmark } from 'lucide-react';
import { useLanguage } from '../../../../hooks/useLanguage';
import { ButtonLink } from '../../../ui/Button';
import { PlanShowcaseCard } from '../PlanShowcaseCard';
import { ViewHeader } from '../DashboardLayout';

export function ProgramsView() {
  const { t } = useLanguage();

  return (
    <div className="min-w-0">
      <ViewHeader
        title={t.dashboard.programs.title}
        subtitle={t.dashboard.programs.subtitle}
        action={
          <ButtonLink to="/dashboard/favoris" variant="outline" size="sm" icon={<Bookmark />}>
            {t.dashboard.programs.favorites}
          </ButtonLink>
        }
      />
      <div className="mt-10 grid min-w-0 items-stretch gap-6 sm:mt-12 sm:gap-8 lg:grid-cols-2">
        <PlanShowcaseCard plan="standard" variant="full" />
        <PlanShowcaseCard plan="premium" variant="full" />
      </div>
      <p className="mt-8 px-4 text-center text-xs font-medium leading-relaxed text-muted sm:mt-10">{t.plans.note}</p>
    </div>
  );
}
