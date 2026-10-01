import { cn } from '../../utils/cn';
import { useLanguage } from '../../hooks/useLanguage';
import type { Lang } from '../../types';

const LANGS: Lang[] = ['fr', 'en'];

/** FR | EN segmented switch — updates instantly, persisted in localStorage. */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { lang, setLang, t } = useLanguage();
  return (
    <div role="group" aria-label={t.nav.language} className={cn('inline-flex items-center rounded-full border border-edge bg-night-900/40 p-0.5', className)}>
      {LANGS.map((code) => {
        const active = lang === code;
        return (
          <button
            key={code}
            type="button"
            lang={code}
            aria-pressed={active}
            onClick={() => setLang(code)}
            className={cn(
              'h-7 min-w-9 rounded-full px-2.5 text-[11px] font-extrabold uppercase tracking-[0.14em] transition-colors duration-200',
              active ? 'bg-volt text-night-900' : 'text-muted hover:text-ink',
            )}
          >
            {code}
          </button>
        );
      })}
    </div>
  );
}
