import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Lock, LogIn } from 'lucide-react';
import { useLanguage } from '../../../../hooks/useLanguage';
import { ButtonLink } from '../../../ui/Button';
import { Logo } from '../../../ui/Logo';

export function GuestScreen() {
  const { t } = useLanguage();
  const location = useLocation();

  return (
    <section className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-night-900 px-4 py-16">
      <div aria-hidden className="absolute inset-0 -z-10 pattern-grid fade-mask-radial" />
      <div className="w-full max-w-lg animate-fade-up rounded-2xl border border-edge bg-night-800 p-8 text-center sm:p-10">
        <div className="flex justify-center">
          <Logo />
        </div>
        <span className="mx-auto mt-8 grid h-16 w-16 place-items-center rounded-full border border-volt/40 bg-volt/10 text-volt">
          <Lock className="h-7 w-7" aria-hidden />
        </span>
        <h1 className="mt-6 font-display text-4xl uppercase">{t.dashboard.guest.title}</h1>
        <p className="mt-3 text-muted">{t.dashboard.guest.text}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <ButtonLink to="/connexion" state={{ from: location.pathname }} icon={<LogIn />}>
            {t.dashboard.guest.login}
          </ButtonLink>
        </div>
        <Link to="/" className="mt-6 inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted transition-colors hover:text-ink">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t.dashboard.guest.back}
        </Link>
      </div>
    </section>
  );
}