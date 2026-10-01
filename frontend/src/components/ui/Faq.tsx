import { Plus } from 'lucide-react';
import { cn } from '../../utils/cn';

interface FaqItem {
  q: string;
  a: string;
}

/** Accessible accordion built on native <details>/<summary>. */
export function FaqList({ items, className }: { items: FaqItem[]; className?: string }) {
  return (
    <div className={cn('divide-y divide-edge rounded-2xl border border-edge bg-night-800', className)}>
      {items.map((item, index) => (
        <details key={item.q} className="group px-5 sm:px-6" open={index === 0}>
          <summary className="flex list-none items-center justify-between gap-4 py-5 font-bold transition-colors duration-200 hover:text-volt">
            <span>{item.q}</span>
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-edge transition-transform duration-300 group-open:rotate-45 group-open:border-volt group-open:text-volt">
              <Plus className="h-4 w-4" aria-hidden />
            </span>
          </summary>
          <p className="pb-5 pr-12 text-sm leading-relaxed text-muted">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
