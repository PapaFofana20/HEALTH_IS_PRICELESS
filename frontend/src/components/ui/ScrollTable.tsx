import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { MoveHorizontal } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useLanguage } from '../../hooks/useLanguage';

interface ScrollTableProps {
  children: ReactNode;
  /** Class applied to the scroll viewport (border, radius, background). */
  className?: string;
  /** Gradient stop colour of the edge fades. */
  fadeClassName?: string;
}

/** Horizontally scrollable table with an edge fade + hint telling mobile users they can swipe. */
export function ScrollTable({ children, className, fadeClassName = 'from-night-900' }: ScrollTableProps) {
  const { t } = useLanguage();
  const viewport = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const node = viewport.current;
    if (!node) return;

    const update = () => {
      const max = node.scrollWidth - node.clientWidth;
      if (max <= 2) {
        setOverflowing(false);
        setAtEnd(true);
        return;
      }
      setOverflowing(true);
      setAtEnd(node.scrollLeft >= max - 2);
    };

    update();
    node.addEventListener('scroll', update, { passive: true });
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    observer?.observe(node);
    return () => {
      node.removeEventListener('scroll', update);
      observer?.disconnect();
    };
  }, []);

  return (
    <div>
      <div className="relative">
        <div ref={viewport} className={cn('overflow-x-auto', className)}>
          {children}
        </div>
        {overflowing && !atEnd && (
          <div
            aria-hidden
            className={cn('pointer-events-none absolute inset-y-0 right-0 w-14 bg-linear-to-l to-transparent', fadeClassName)}
          />
        )}
        {overflowing && (
          <div
            aria-hidden
            className={cn('pointer-events-none absolute inset-y-0 left-0 w-8 bg-linear-to-r to-transparent', fadeClassName)}
          />
        )}
      </div>
      {overflowing && (
        <p className="mt-2 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">
          <MoveHorizontal className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {t.common.scrollHint}
        </p>
      )}
    </div>
  );
}