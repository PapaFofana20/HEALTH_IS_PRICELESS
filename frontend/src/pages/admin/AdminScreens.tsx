import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Lock, LogIn, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { ADMIN_EMAIL } from '../../hooks/useAuth';
import { ButtonLink } from '../../components/ui/Button';
import { Logo } from '../../components/ui/Logo';

export function AdminGuestScreen() {
  const { t } = useLanguage();
  const location = useLocation();

  return (
    <section className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-night-900 px-4 py-16 sm:px-6">
      <div aria-hidden className="absolute inset-0 -z-10 pattern-grid fade-mask-radial" />
      <div className="w-full max-w-lg animate-fade-up rounded-2xl border border-edge/70 bg-night-800/70 p-6 text-center sm:p-10">
        <div className="flex justify-center">
          <Logo />
        </div>
        <span className="mx-auto mt-8 grid h-16 w-16 place-items-center rounded-2xl border border-volt/40 bg-volt/10 text-volt">
          <Lock className="h-7 w-7" aria-hidden />
        </span>
        <h1 className="mt-6 font-display text-4xl uppercase tracking-tight">{t.admin.guestTitle}</h1>
        <p className="mt-3 leading-relaxed text-muted">{t.admin.guestText}</p>
        <p className="mt-5 rounded-xl border border-edge/70 bg-night-900/60 px-4 py-3.5 text-sm">
          <span className="text-muted">{t.admin.guestHint} </span>
          <span className="font-bold text-volt">{ADMIN_EMAIL}</span>
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <ButtonLink to="/connexion" state={{ from: location.pathname }} icon={<LogIn />}>
            {t.admin.guestLogin}
          </ButtonLink>
        </div>
        <Link to="/" className="mt-7 inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-muted transition-colors hover:text-ink">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t.dashboard.guest.back}
        </Link>
      </div>
    </section>
  );
}

export function AdminDeniedScreen() {
  const { t } = useLanguage();

  return (
    <section className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-night-900 px-4 py-16 sm:px-6">
      <div aria-hidden className="absolute inset-0 -z-10 pattern-grid fade-mask-radial" />
      <div className="w-full max-w-lg animate-fade-up rounded-2xl border border-edge/70 bg-night-800/70 p-6 text-center sm:p-10">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-danger/40 bg-danger/10 text-danger">
          <ShieldAlert className="h-7 w-7" aria-hidden />
        </span>
        <h1 className="mt-6 font-display text-4xl uppercase tracking-tight">{t.admin.deniedTitle}</h1>
        <p className="mt-3 leading-relaxed text-muted">{t.admin.deniedText}</p>
        <p className="mt-5 rounded-xl border border-edge/70 bg-night-900/60 px-4 py-3.5 text-sm">
          <span className="text-muted">{t.admin.guestHint} </span>
          <span className="font-bold text-volt">{ADMIN_EMAIL}</span>
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <ButtonLink to="/dashboard" iconRight={<ArrowRight />}>
            {t.admin.deniedCta}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}