import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useLanguage } from '../../../hooks/useLanguage';
import { Tag } from '../../ui/Badge';
import type { Article } from '../../../types';

interface ArticleCardProps {
  article: Article;
  variant?: 'default' | 'featured';
  className?: string;
}

export function ArticleCard({ article, variant = 'default', className }: ArticleCardProps) {
  const { t, loc, fmtDate } = useLanguage();
  const href = `/conseils/${article.id}`;

  if (variant === 'featured') {
    return (
      <article
        className={cn(
          'group relative grid overflow-hidden rounded-2xl border border-edge bg-night-800 transition-colors duration-300 hover:border-edge-strong has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-volt lg:grid-cols-2',
          className,
        )}
      >
        <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:min-h-[440px]">
          <img src={article.image} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
          <div aria-hidden className="absolute inset-0 bg-linear-to-t from-night-800/70 to-transparent lg:bg-linear-to-r lg:from-transparent lg:to-night-800/40" />
          <Tag tone="volt" className="absolute left-4 top-4 bg-night-900/80">
            {t.articlesPage.featured}
          </Tag>
        </div>
        <div className="flex flex-col justify-center p-6 sm:p-10">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-volt">{t.articleCategories[article.category]}</p>
          <h2 className="mt-3 font-display text-4xl uppercase leading-[0.95] tracking-tight sm:text-5xl">
            <Link to={href} className="outline-none after:absolute after:inset-0 after:content-['']">
              {loc(article.title)}
            </Link>
          </h2>
          <p className="mt-4 leading-relaxed text-muted">{loc(article.excerpt)}</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-muted">
            <span>
              {t.articlesPage.by} {article.author}
            </span>
            <span aria-hidden></span>
            <time dateTime={article.date}>{fmtDate(article.date)}</time>
            <span aria-hidden></span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              {t.common.minRead(article.readMinutes)}
            </span>
          </div>
          <span className="mt-8 inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.14em] transition-colors group-hover:text-volt">
            {t.common.readArticle}
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
          </span>
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-xl border border-edge bg-night-800 transition-all duration-300 hover:-translate-y-1 hover:border-edge-strong hover:shadow-2xl hover:shadow-black/40 has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-volt',
        className,
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img src={article.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
        <Tag tone="light" className="absolute left-3 top-3">
          {t.articleCategories[article.category]}
        </Tag>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-muted">
          <Clock className="h-3.5 w-3.5" aria-hidden />
          {t.common.minRead(article.readMinutes)}
        </p>
        <h3 className="mt-2 font-display text-2xl uppercase leading-[1.05] tracking-wide">
          <Link to={href} className="outline-none after:absolute after:inset-0 after:content-['']">
            {loc(article.title)}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{loc(article.excerpt)}</p>
        <span className="mt-auto inline-flex items-center gap-2 pt-5 text-[11px] font-extrabold uppercase tracking-[0.14em] transition-colors group-hover:text-volt">
          {t.common.readArticle}
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
        </span>
      </div>
    </article>
  );
}
