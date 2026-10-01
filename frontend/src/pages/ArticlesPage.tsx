import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, Clock, Info, Link2, Newspaper } from 'lucide-react';
import { cn } from '../utils/cn';
import { useLanguage, usePageTitle } from '../hooks/useLanguage';
import { useAsync } from '../hooks/useAsync';
import { api } from '../services/api';
import { articles } from '../data/articles';
import { ArticleCard } from '../components/features/articles/ArticleCard';
import { Chip, Tag } from '../components/ui/Badge';
import { Reveal } from '../components/ui/Reveal';
import { PageHero, SectionHeading, container } from '../components/ui/SectionHeading';
import { EmptyState, ErrorState, GridSkeleton, NotFoundState, Skeleton } from '../components/ui/States';
import type { ArticleCategory } from '../types';

type CategoryFilter = 'all' | ArticleCategory;
const CATEGORIES: CategoryFilter[] = ['all', 'weight-loss', 'muscle-gain', 'nutrition', 'training', 'recovery'];

/* ==========================================================
   /conseils — editorial listing
   ========================================================== */
export default function ArticlesPage() {
  const { t } = useLanguage();
  usePageTitle(t.nav.advice);
  const [params, setParams] = useSearchParams();
  const { data, loading, error, refetch } = useAsync(() => api.getArticles(), []);

  const raw = params.get('cat');
  const category: CategoryFilter = CATEGORIES.includes(raw as CategoryFilter) ? (raw as CategoryFilter) : 'all';
  const setCategory = (value: CategoryFilter) => {
    const next = new URLSearchParams(params);
    if (value === 'all') next.delete('cat');
    else next.set('cat', value);
    setParams(next, { replace: true });
  };

  const list = data ?? [];
  const featured = category === 'all' ? list.find((article) => article.featured) : undefined;
  const filtered = list.filter((article) => (category === 'all' || article.category === category) && article.id !== featured?.id);

  return (
    <>
      <PageHero
        eyebrow={t.articlesPage.eyebrow}
        title={
          <>
            {t.articlesPage.title1} <span className="text-volt">{t.articlesPage.title2}</span>
          </>
        }
        subtitle={t.articlesPage.subtitle}
      />
      <section className="py-10 lg:py-14">
        <div className={container}>
          <div role="group" aria-label={t.articlesPage.filtersLabel} className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {CATEGORIES.map((value) => (
              <Chip key={value} active={category === value} onClick={() => setCategory(value)}>
                {value === 'all' ? t.common.all : t.articleCategories[value]}
              </Chip>
            ))}
          </div>

          <div className="mt-8">
            {loading ? (
              <GridSkeleton count={6} />
            ) : error ? (
              <ErrorState title={t.articlesPage.errorTitle} onRetry={refetch} />
            ) : !featured && filtered.length === 0 ? (
              <EmptyState icon={<Newspaper aria-hidden />} title={t.articlesPage.emptyTitle} />
            ) : (
              <div className="space-y-8">
                {featured && (
                  <Reveal>
                    <ArticleCard article={featured} variant="featured" />
                  </Reveal>
                )}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((article, index) => (
                    <Reveal key={article.id} delay={index * 60} className="h-full">
                      <ArticleCard article={article} />
                    </Reveal>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

/* ==========================================================
   /conseils/:id — article detail
   ========================================================== */
export function ArticleDetailPage() {
  const { id = '' } = useParams();
  const { t, loc, fmtDate } = useLanguage();
  const { data: article, loading, error, refetch } = useAsync(() => api.getArticle(id), [id]);
  const [copied, setCopied] = useState(false);
  usePageTitle(article ? loc(article.title) : t.nav.advice);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 pb-20 pt-32 sm:px-6" role="status">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-8 h-14 w-full" />
        <Skeleton className="mt-3 h-14 w-2/3" />
        <Skeleton className="mt-8 aspect-[16/9] w-full" />
      </div>
    );
  }
  if (error) {
    return (
      <div className={cn(container, 'pb-20 pt-32')}>
        <ErrorState onRetry={refetch} />
      </div>
    );
  }
  if (!article) {
    return <NotFoundState title={t.articlesPage.notFoundTitle} text={t.articlesPage.notFoundText} backTo="/conseils" backLabel={t.articlesPage.back} />;
  }

  const related = articles
    .filter((item) => item.id !== article.id)
    .sort((a, b) => Number(b.category === article.category) - Number(a.category === article.category))
    .slice(0, 3);

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <article>
        <header className="relative isolate overflow-hidden border-b border-edge pb-12 pt-28 lg:pb-16 lg:pt-36">
          <img src={article.image} alt="" aria-hidden className="absolute inset-0 -z-20 h-full w-full object-cover opacity-25" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-night-900 via-night-900/85 to-night-900/60" />
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <Link
              to="/conseils"
              className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted transition-colors hover:text-volt"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              {t.articlesPage.back}
            </Link>
            <div className="mt-8">
              <Tag tone="volt">{t.articleCategories[article.category]}</Tag>
            </div>
            <h1 className="mt-4 animate-fade-up font-display text-4xl uppercase leading-[0.95] tracking-tight sm:text-6xl">{loc(article.title)}</h1>
            <p className="mt-5 text-lg leading-relaxed text-ink/80">{loc(article.excerpt)}</p>
            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3 text-sm font-semibold text-muted">
              <span>
                {t.articlesPage.by} <span className="text-ink">{article.author}</span>
              </span>
              <span aria-hidden>•</span>
              <time dateTime={article.date}>{fmtDate(article.date)}</time>
              <span aria-hidden>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" aria-hidden />
                {t.common.minRead(article.readMinutes)}
              </span>
              <button
                type="button"
                onClick={share}
                className="inline-flex items-center gap-2 rounded-full border border-edge px-3 py-1.5 text-xs font-bold text-ink transition-colors hover:border-volt hover:text-volt sm:ml-auto"
              >
                {copied ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Link2 className="h-3.5 w-3.5" aria-hidden />}
                <span aria-live="polite">{copied ? t.articlesPage.copied : t.articlesPage.share}</span>
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
          <img src={article.image} alt="" className="aspect-[16/9] w-full rounded-2xl border border-edge object-cover" />
          <div className="mt-12 space-y-10">
            {article.sections.map((section, index) => (
              <section key={section.heading.fr}>
                <h2 className="flex items-baseline gap-3 font-display text-3xl uppercase leading-tight">
                  <span className="text-volt">0{index + 1}</span>
                  {loc(section.heading)}
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-ink/85">{loc(section.body)}</p>
              </section>
            ))}
          </div>
          <aside className="mt-12 rounded-2xl border border-volt/30 bg-volt/5 p-6">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-volt">{t.articlesPage.takeaway}</p>
            <p className="mt-2 font-semibold leading-relaxed">{loc(article.excerpt)}</p>
          </aside>
          <p className="mt-8 flex items-start gap-2 text-xs text-muted">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            {t.articlesPage.disclaimer}
          </p>
        </div>
      </article>

      <section className="border-t border-edge bg-night-800/40 py-16 lg:py-20">
        <div className={container}>
          <SectionHeading title={t.articlesPage.related} />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {related.map((item) => (
              <ArticleCard key={item.id} article={item} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
