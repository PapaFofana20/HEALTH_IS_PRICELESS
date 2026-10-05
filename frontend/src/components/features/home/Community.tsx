import { useState } from 'react';
import type { FormEvent } from 'react';
import { CircleCheck, LoaderCircle, Mail } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useLanguage } from '../../../hooks/useLanguage';
import { isValidEmail } from '../../../hooks/useAuth';
import { Button } from '../../ui/Button';
import { Reveal } from '../../ui/Reveal';
import { container } from '../../ui/SectionHeading';

/* ---------- Newsletter ---------- */
type NewsletterStatus = 'idle' | 'loading' | 'success' | 'error';

export function Newsletter() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<NewsletterStatus>('idle');

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValidEmail(email)) {
      setStatus('error');
      return;
    }
    setStatus('loading');
    window.setTimeout(() => setStatus('success'), 700);
  };

  return (
    <section aria-labelledby="newsletter-title" className="bg-night-900 pb-20 pt-16 lg:pb-28 lg:pt-20">
      <div className={container}>
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-volt px-6 py-12 text-night-900 sm:px-10 lg:px-16 lg:py-16">
            <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-1/2 pattern-stripes-dark opacity-[0.14] fade-mask-left" />
            <span aria-hidden className="pointer-events-none absolute -bottom-12 right-4 select-none font-display text-[12rem] leading-none txt-outline-dark sm:text-[16rem]">
              0
            </span>
            <div className="relative grid items-center gap-10 lg:grid-cols-2">
              <div>
                <h2 id="newsletter-title" className="font-display text-4xl uppercase leading-[0.95] tracking-tight sm:text-5xl lg:text-6xl">
                  {t.newsletter.title1}
                  <span className="mt-3 block w-fit -skew-x-6 bg-night-900 px-3 py-1 text-volt">{t.newsletter.title2}</span>
                </h2>
                <p className="mt-5 max-w-md font-medium text-night-900/75">{t.newsletter.text}</p>
              </div>
              <form onSubmit={onSubmit} noValidate className="w-full">
                {status === 'success' ? (
                  <p role="status" className="flex items-center gap-3 rounded-2xl bg-night-900 p-5 font-bold text-volt">
                    <CircleCheck className="h-6 w-6 shrink-0" aria-hidden />
                    {t.newsletter.success}
                  </p>
                ) : (
                  <>
                    <label htmlFor="newsletter-email" className="text-[11px] font-extrabold uppercase tracking-[0.2em]">
                      {t.newsletter.label}
                    </label>
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                      <div className="relative flex-1">
                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-night-900/50" aria-hidden />
                        <input
                          id="newsletter-email"
                          type="email"
                          autoComplete="email"
                          value={email}
                          onChange={(event) => {
                            setEmail(event.target.value);
                            if (status === 'error') setStatus('idle');
                          }}
                          placeholder={t.newsletter.placeholder}
                          aria-invalid={status === 'error'}
                          aria-describedby="newsletter-help"
                          className={cn(
                            'h-13 w-full rounded-full border-2 bg-white/75 pl-11 pr-4 text-sm font-semibold text-night-900 placeholder:text-night-900/45 transition-colors focus:bg-white focus:outline-none',
                            status === 'error' ? 'border-red-700' : 'border-night-900/15 focus:border-night-900',
                          )}
                        />
                      </div>
                      <Button type="submit" variant="dark" size="lg" disabled={status === 'loading'} icon={status === 'loading' ? <LoaderCircle className="" /> : undefined}>
                        {t.newsletter.cta}
                      </Button>
                    </div>
                    <p id="newsletter-help" className={cn('mt-3 text-xs font-semibold', status === 'error' ? 'text-red-800' : 'text-night-900/65')}>
                      {status === 'error' ? t.newsletter.invalid : t.newsletter.privacy}
                    </p>
                  </>
                )}
              </form>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
