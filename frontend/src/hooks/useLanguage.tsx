import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { fr } from '../locales/fr';
import type { Translations } from '../locales/fr';
import { en } from '../locales/en';
import type { Lang, Localized } from '../types';

const STORAGE_KEY = 'forge-lang';
const dictionaries: Record<Lang, Translations> = { fr, en };

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** UI dictionary for the active language */
  t: Translations;
  /** Pick the active language from a localized data field */
  loc: <T>(value: Localized<T>) => T;
  fmtNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  fmtDate: (iso: string, options?: Intl.DateTimeFormatOptions) => string;
  fmtPrice: (value: number) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readInitialLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'fr' || stored === 'en') return stored;
  } catch {
    /* storage unavailable */
  }
  return 'fr';
}

function toDate(iso: string) {
  return iso.length === 10 ? new Date(`${iso}T12:00:00`) : new Date(iso);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readInitialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* storage unavailable */
    }
  }, [lang]);

  const setLang = useCallback((next: Lang) => setLangState(next), []);

  const value = useMemo<LanguageContextValue>(() => {
    const locale = lang === 'fr' ? 'fr-FR' : 'en-GB';
    return {
      lang,
      setLang,
      t: dictionaries[lang],
      loc: <T,>(field: Localized<T>): T => field[lang],
      fmtNumber: (v, options) => new Intl.NumberFormat(locale, options).format(v),
      fmtDate: (iso, options) =>
        new Intl.DateTimeFormat(locale, options ?? { day: 'numeric', month: 'short', year: 'numeric' }).format(toDate(iso)),
      fmtPrice: (v) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(v),
    };
  }, [lang, setLang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>');
  return ctx;
}

/** Updates the document title (translated). */
export function usePageTitle(title?: string) {
  const { t } = useLanguage();
  useEffect(() => {
    document.title = title ? `${title} — ${t.brand.name}` : t.brand.defaultTitle;
  }, [title, t]);
}
