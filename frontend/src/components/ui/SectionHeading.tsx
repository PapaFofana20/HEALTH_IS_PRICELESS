import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

/** Shared page container width + gutters. */
export const container = 'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8';

export function Eyebrow({ children, tone = 'dark', className }: { children: ReactNode; tone?: 'dark' | 'light'; className?: string }) {
  return (
    <p
      className={cn(
        'inline-flex items-center gap-3 text-[11px] font-extrabold uppercase tracking-[0.26em] sm:text-xs',
        tone === 'dark' ? 'text-muted' : 'text-night-900/60',
        className,
      )}
    >
      <span aria-hidden className={cn('font-display text-base tracking-[-0.04em]', tone === 'dark' ? 'text-volt' : 'text-night-900/40')}>
        ///
      </span>
      {children}
    </p>
  );
}

interface SectionHeadingProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  align?: 'left' | 'center';
  tone?: 'dark' | 'light';
  as?: 'h1' | 'h2' | 'h3';
  id?: string;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  action,
  align = 'left',
  tone = 'dark',
  as = 'h2',
  id,
  className,
}: SectionHeadingProps) {
  const Heading = as;
  const centered = align === 'center';
  return (
    <div
      className={cn(
        'flex flex-col gap-6',
        centered ? 'items-center text-center' : 'md:flex-row md:items-end md:justify-between',
        className,
      )}
    >
      <div className={cn('max-w-2xl', centered && 'mx-auto')}>
        {eyebrow && <Eyebrow tone={tone}>{eyebrow}</Eyebrow>}
        <Heading
          id={id}
          className={cn(
            'mt-3 font-display text-4xl uppercase leading-[0.95] tracking-tight sm:text-5xl lg:text-6xl',
            tone === 'dark' ? 'text-ink' : 'text-night-900',
          )}
        >
          {title}
        </Heading>
        {subtitle && (
          <p className={cn('mt-4 text-base leading-relaxed sm:text-lg', tone === 'dark' ? 'text-muted' : 'text-slate-600')}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

interface PageHeroProps {
  eyebrow: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  image?: string;
  children?: ReactNode;
  className?: string;
}

/** Top banner used by inner pages (accounts for the fixed header). */
export function PageHero({ eyebrow, title, subtitle, image, children, className }: PageHeroProps) {
  return (
    <section className={cn('relative isolate overflow-hidden border-b border-edge bg-night-900 pb-14 pt-32 sm:pb-16 lg:pb-20 lg:pt-40', className)}>
      {image && (
        <>
          <img src={image} alt="" aria-hidden className="absolute inset-0 -z-20 h-full w-full object-cover opacity-50" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-r from-night-900/95 via-night-900/60 to-night-900/20" />
        </>
      )}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 pattern-grid fade-mask-radial" />
      <div aria-hidden className="pointer-events-none absolute -right-12 top-28 -z-10 hidden h-72 w-72 rotate-12 border border-volt/20 lg:block" />
      <div aria-hidden className="pointer-events-none absolute right-24 top-44 -z-10 hidden h-40 w-40 rotate-12 pattern-stripes opacity-20 lg:block" />
      <div className={container}>
        <Eyebrow className="">{eyebrow}</Eyebrow>
        <h1 className="mt-4 max-w-4xl  font-display text-5xl uppercase leading-[0.92] tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-6 max-w-2xl  text-base leading-relaxed text-muted sm:text-lg">{subtitle}</p>
        )}
        {children && <div className="mt-8 ">{children}</div>}
      </div>
    </section>
  );
}
