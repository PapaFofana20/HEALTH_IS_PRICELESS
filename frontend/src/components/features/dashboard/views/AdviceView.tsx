import { useSearchParams } from 'react-router-dom';
import { Newspaper } from 'lucide-react';
import { useLanguage } from '../../../../hooks/useLanguage';
import { useAsync } from '../../../../hooks/useAsync';
import { api } from '../../../../services/api';
import { ArticleCard } from '../../articles/ArticleCard';
import { Chip } from '../../../ui/Badge';
import { EmptyState, ErrorState, GridSkeleton } from '../../../ui/States';
import { ViewHeader } from '../DashboardLayout';
import type { ArticleCategory } from '../../../../types';

type CategoryFilter = 'all' | ArticleCategory;

const CATEGORIES: CategoryFilter[] = ['all', 'weight-loss', 'muscle-gain', 'nutrition', 'training', 'recovery'];

export function AdviceView() {
  const { t } = useLanguage();
  const { data, loading, error, refetch } = useAsync(() => api.getArticles(), []);
  const [params, setParams] = useSearchParams();

  const raw = params.get('cat');
  const category: CategoryFilter = CATEGORIES.includes(raw as CategoryFilter) ? (raw as CategoryFilter) : 'all';
  const setCategory = (value: CategoryFilter) => {
    const next = new URLSearchParams(params);
    if (value === 'all') next.delete('cat');
    else next.set('cat', value);
    setParams(next, { replace: true });
  };

  const list = (data ?? []).filter((article) => category === 'all' || article.category === category);

  return (
    <div className="min-w-0">
      <ViewHeader title={t.dashboard.advice.title} subtitle={t.dashboard.advice.subtitle} />

      <div className="mt-6 sm:mt-8">
        <div role="group" aria-label={t.articlesPage.filtersLabel} className="scrollbar-none -mx-1 flex gap-2.5 overflow-x-auto px-1 pb-2">
          {CATEGORIES.map((value) => (
            <Chip key={value} active={category === value} onClick={() => setCategory(value)}>
              {value === 'all' ? t.common.all : t.articleCategories[value]}
            </Chip>
          ))}
        </div>
      </div>

      <div className="mt-8 sm:mt-10">
        {loading ? (
          <GridSkeleton count={6} />
        ) : error ? (
          <ErrorState title={t.articlesPage.errorTitle} onRetry={refetch} />
        ) : list.length === 0 ? (
          <EmptyState icon={<Newspaper aria-hidden />} title={t.articlesPage.emptyTitle} />
        ) : (
          <div className="grid min-w-0 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
