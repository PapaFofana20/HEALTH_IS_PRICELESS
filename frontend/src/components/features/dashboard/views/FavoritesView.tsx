import { Bookmark } from 'lucide-react';
import { useLanguage } from '../../../../hooks/useLanguage';
import { useAuth } from '../../../../hooks/useAuth';
import { programs } from '../../../../data/programs';
import { ProgramCard } from '../../programs/ProgramCard';
import { ButtonLink } from '../../../ui/Button';
import { EmptyState } from '../../../ui/States';
import { ViewHeader } from '../DashboardLayout';

export function FavoritesView() {
  const { t } = useLanguage();
  const { favorites } = useAuth();
  const list = programs.filter((program) => favorites.includes(program.id));

  return (
    <div>
      <ViewHeader title={t.dashboard.favorites.title} subtitle={t.dashboard.favorites.subtitle} />
      {list.length === 0 ? (
        <EmptyState
          icon={<Bookmark aria-hidden />}
          title={t.dashboard.favorites.emptyTitle}
          text={t.dashboard.favorites.emptyText}
          action={<ButtonLink to="/dashboard/programmes">{t.dashboard.favorites.browse}</ButtonLink>}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((program) => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </div>
      )}
    </div>
  );
}