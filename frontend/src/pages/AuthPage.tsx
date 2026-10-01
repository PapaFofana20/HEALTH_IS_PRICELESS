import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Check, Crown, Dumbbell, Eye, EyeOff, Flame, LoaderCircle, Lock, LogOut, Mail, User as UserIcon } from 'lucide-react';
import { cn } from '../utils/cn';
import { useLanguage, usePageTitle } from '../hooks/useLanguage';
import { useAuth, isValidEmail } from '../hooks/useAuth';
import { media } from '../data/media';
import { Button, ButtonLink } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { cgu, privacy } from '../data/legal';
import type { Goal, Localized, Plan } from '../types';

type Mode = 'login' | 'register';
type FieldKey = 'firstName' | 'email' | 'password';
type Errors = Partial<Record<FieldKey | 'form' | 'legal', string>>;
type LegalDocKey = 'cgu' | 'privacy';

const labelClass = 'text-[11px] font-extrabold uppercase tracking-[0.16em] text-muted';
const inputClass = (invalid?: string) =>
  cn(
    'h-12 w-full rounded-lg border bg-night-900 pl-11 pr-4 text-sm font-semibold text-ink transition-colors placeholder:text-muted/60 focus:outline-none',
    invalid ? 'border-danger/70' : 'border-edge focus:border-volt',
  );

interface AuthFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon: ReactNode;
  error?: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
}

function AuthField({ id, label, value, onChange, icon, error, type = 'text', autoComplete, placeholder }: AuthFieldProps) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div className="relative mt-2">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
        <input
          id={id}
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={inputClass(error)}
        />
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-2 text-xs font-semibold text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export default function AuthPage() {
  const { t, loc } = useLanguage();
  const { user, login, register, logout, setTier } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const mode: Mode = params.get('mode') === 'register' ? 'register' : 'login';
  usePageTitle(mode === 'login' ? t.auth.loginTab : t.auth.registerTab);
  const planParam = params.get('plan');
  const plan: Plan | null = planParam === 'standard' || planParam === 'premium' ? planParam : null;

  const [form, setForm] = useState({ firstName: '', email: '', password: '', goal: 'weight-loss' as Goal });
  const [errors, setErrors] = useState<Errors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [legalDoc, setLegalDoc] = useState<LegalDocKey | null>(null);

  const switchMode = (next: Mode) => {
    const nextParams = new URLSearchParams(params);
    if (next === 'register') nextParams.set('mode', 'register');
    else nextParams.delete('mode');
    setParams(nextParams, { replace: true });
    setErrors({});
    setInfo(null);
  };

  const validate = (): Errors => {
    const found: Errors = {};
    if (mode === 'register' && !form.firstName.trim()) found.firstName = t.auth.errors.firstName;
    if (!isValidEmail(form.email)) found.email = t.auth.errors.email;
    if (form.password.length < 6) found.password = t.auth.errors.password;
    if (mode === 'register' && !acceptedLegal) found.legal = t.auth.legalError;
    return found;
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    const firstError = (['firstName', 'email', 'password'] as FieldKey[]).find((key) => found[key]);
    if (firstError) {
      document.getElementById(`auth-${firstError}`)?.focus();
      return;
    }
    if (found.legal) {
      document.getElementById('auth-legal')?.focus();
      return;
    }
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        if (plan) setTier(plan);
      } else {
        await register({ firstName: form.firstName, email: form.email, password: form.password, goal: form.goal, tier: plan ?? 'free' });
      }
      navigate('/dashboard', { state: plan ? { notice: t.plans.activated(t.tiers[plan]) } : null });
    } catch (thrown) {
      const code = thrown instanceof Error ? thrown.message : '';
      setErrors({ form: code === 'confirm-email' ? t.auth.errors.confirmEmail : t.auth.errors.generic });
      setSubmitting(false);
    }
  };

  if (user && !submitting) {
    return (
      <section className="relative isolate flex min-h-[85vh] items-center justify-center px-4 pb-20 pt-32">
        <div aria-hidden className="absolute inset-0 -z-10 pattern-grid fade-mask-radial" />
        <div className="w-full max-w-md animate-fade-up rounded-2xl border border-edge bg-night-800 p-8 text-center">
          <img src={user.avatar} alt="" className="mx-auto h-16 w-16 rounded-full object-cover ring-2 ring-volt" />
          <h1 className="mt-5 font-display text-4xl uppercase">{t.auth.loggedInTitle}</h1>
          <p className="mt-2 text-muted">{t.auth.loggedInText(user.firstName)}</p>
          <div className="mt-8 flex flex-col gap-3">
            <ButtonLink to="/dashboard" size="lg" iconRight={<ArrowRight />}>
              {t.auth.goDashboard}
            </ButtonLink>
            <Button variant="outline" icon={<LogOut />} onClick={logout}>
              {t.nav.logout}
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative isolate min-h-screen pt-16 lg:pt-20">
      <div className="grid min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-5rem)] lg:grid-cols-2">
        <aside className="relative hidden overflow-hidden lg:block">
          <img src={media.authSide} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div aria-hidden className="absolute inset-0 bg-linear-to-t from-night-900 via-night-900/60 to-night-900/10" />
          <div aria-hidden className="absolute left-10 top-10 h-40 w-40 rotate-12 pattern-stripes opacity-30" />
          <div className="absolute inset-x-0 bottom-0 p-12">
            <p className="font-display text-6xl uppercase leading-[0.92] xl:text-7xl">{t.auth.sideTitle}</p>
            <p className="mt-4 max-w-md text-ink/80">{t.auth.sideText}</p>
            <ul className="mt-8 space-y-3">
              {t.auth.sidePoints.map((point) => (
                <li key={point} className="flex items-center gap-3 font-semibold">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-volt text-night-900">
                    <Check className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="relative flex items-center justify-center px-4 py-12 sm:px-6 lg:px-12">
          <div aria-hidden className="absolute inset-0 -z-10 pattern-grid fade-mask-radial lg:hidden" />
          <div className="w-full max-w-md">
            <div role="group" aria-label={`${t.auth.loginTab} / ${t.auth.registerTab}`} className="grid grid-cols-2 rounded-full border border-edge bg-night-800 p-1">
              {(['login', 'register'] as Mode[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={mode === option}
                  onClick={() => switchMode(option)}
                  className={cn(
                    'h-10 rounded-full text-[11px] font-extrabold uppercase tracking-[0.14em] transition-colors duration-200',
                    mode === option ? 'bg-volt text-night-900' : 'text-muted hover:text-ink',
                  )}
                >
                  {option === 'login' ? t.auth.loginTab : t.auth.registerTab}
                </button>
              ))}
            </div>

            <h1 key={mode} className="mt-10 animate-fade-up font-display text-5xl uppercase leading-none">
              {mode === 'login' ? t.auth.loginTitle : t.auth.registerTitle}
            </h1>
            <p className="mt-3 text-muted">{mode === 'login' ? t.auth.loginSubtitle : t.auth.registerSubtitle}</p>
            {plan && (
              <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-volt/40 bg-volt/10 px-3.5 py-1.5 text-xs font-bold text-volt">
                <Crown className="h-3.5 w-3.5" aria-hidden />
                {t.auth.selectedPlan} : {t.tiers[plan]}
              </p>
            )}

            <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
              {mode === 'register' && (
                <AuthField
                  id="auth-firstName"
                  label={t.auth.firstName}
                  placeholder={t.auth.placeholders.firstName}
                  value={form.firstName}
                  onChange={(value) => setForm((current) => ({ ...current, firstName: value }))}
                  error={errors.firstName}
                  autoComplete="given-name"
                  icon={<UserIcon aria-hidden />}
                />
              )}
              <AuthField
                id="auth-email"
                type="email"
                label={t.auth.email}
                placeholder={t.auth.placeholders.email}
                value={form.email}
                onChange={(value) => setForm((current) => ({ ...current, email: value }))}
                error={errors.email}
                autoComplete="email"
                icon={<Mail aria-hidden />}
              />
              <div>
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="auth-password" className={labelClass}>
                    {t.auth.password}
                  </label>
                  {mode === 'login' && (
                    <button type="button" onClick={() => setInfo(t.auth.forgotInfo)} className="text-xs font-bold text-volt underline-offset-4 hover:underline">
                      {t.auth.forgot}
                    </button>
                  )}
                </div>
                <div className="relative mt-2">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    placeholder={t.auth.placeholders.password}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                    aria-invalid={Boolean(errors.password) || undefined}
                    aria-describedby={errors.password ? 'auth-password-error' : 'auth-password-hint'}
                    className={cn(inputClass(errors.password), 'pr-12')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? t.auth.hidePassword : t.auth.showPassword}
                    aria-pressed={showPassword}
                    className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-muted transition-colors hover:text-ink"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
                  </button>
                </div>
                {errors.password ? (
                  <p id="auth-password-error" className="mt-2 text-xs font-semibold text-danger">
                    {errors.password}
                  </p>
                ) : (
                  <p id="auth-password-hint" className="mt-2 text-xs text-muted">
                    {t.auth.passwordHint}
                  </p>
                )}
              </div>

              {mode === 'register' && (
                <fieldset>
                  <legend className={labelClass}>{t.auth.goal}</legend>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {(['weight-loss', 'muscle-gain'] as Goal[]).map((goal) => (
                      <button
                        key={goal}
                        type="button"
                        aria-pressed={form.goal === goal}
                        onClick={() => setForm((current) => ({ ...current, goal }))}
                        className={cn(
                          'flex h-12 items-center justify-center gap-2 rounded-lg border text-[11px] font-extrabold uppercase tracking-[0.12em] transition-colors duration-200',
                          form.goal === goal ? 'border-volt bg-volt/10 text-volt' : 'border-edge text-muted hover:border-edge-strong hover:text-ink',
                        )}
                      >
                        {goal === 'weight-loss' ? <Flame className="h-4 w-4" aria-hidden /> : <Dumbbell className="h-4 w-4" aria-hidden />}
                        {t.goals[goal]}
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}

              {mode === 'register' && (
                <div>
                  <label
                    htmlFor="auth-legal"
                    className="flex cursor-pointer items-start gap-3 rounded-lg border border-edge bg-night-900 p-4 text-sm leading-relaxed"
                  >
                    <input
                      id="auth-legal"
                      type="checkbox"
                      checked={acceptedLegal}
                      onChange={(event) => {
                        setAcceptedLegal(event.target.checked);
                        setErrors((current) => ({ ...current, legal: undefined }));
                      }}
                      aria-describedby={errors.legal ? 'auth-legal-error' : undefined}
                      className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-[#C7FF00]"
                    />
                    <span className="text-muted">
                      {t.auth.legalAccept}{' '}
                      <button type="button" onClick={() => setLegalDoc('cgu')} className="font-bold text-volt underline-offset-4 hover:underline">
                        {t.auth.legalCgu}
                      </button>{' '}
                      {t.auth.legalAnd}{' '}
                      <button type="button" onClick={() => setLegalDoc('privacy')} className="font-bold text-volt underline-offset-4 hover:underline">
                        {t.auth.legalPrivacy}
                      </button>
                    </span>
                  </label>
                  {errors.legal && (
                    <p id="auth-legal-error" className="mt-2 text-xs font-semibold text-danger">
                      {errors.legal}
                    </p>
                  )}
                </div>
              )}

              {errors.form && (
                <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">
                  {errors.form}
                </p>
              )}
              {info && (
                <p role="status" className="rounded-lg border border-edge bg-night-800 px-4 py-3 text-sm text-muted">
                  {info}
                </p>
              )}

              <Button type="submit" size="lg" fullWidth disabled={submitting} icon={submitting ? <LoaderCircle className="animate-spin" /> : undefined}>
                {mode === 'login' ? t.auth.submitLogin : t.auth.submitRegister}
              </Button>
            </form>

            {mode === 'register' && <p className="mt-6 text-center text-xs leading-relaxed text-muted">{t.auth.terms}</p>}
          </div>
        </div>
      </div>

      <Modal
        open={legalDoc !== null}
        onClose={() => setLegalDoc(null)}
        title={t.auth.legalTitle}
        description={loc((legalDoc === 'privacy' ? privacy : cgu).updated)}
        size="xl"
      >
        <div role="group" aria-label={t.auth.legalTitle} className="mb-6 inline-flex rounded-full border border-edge bg-night-900 p-1">
          {(['cgu', 'privacy'] as LegalDocKey[]).map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={legalDoc === key}
              onClick={() => setLegalDoc(key)}
              className={cn(
                'rounded-full px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.14em] transition-colors duration-200 sm:px-6',
                legalDoc === key ? 'bg-volt text-night-900' : 'text-muted hover:text-ink',
              )}
            >
              {t.auth.legalTabs[key]}
            </button>
          ))}
        </div>
        {(legalDoc === 'privacy' ? privacy : cgu).sections.map((section) => (
          <section key={loc(section.heading)} aria-label={loc(section.heading)} className="mb-6 last:mb-0">
            <h3 className="font-display text-xl uppercase tracking-wide text-volt">{loc(section.heading)}</h3>
            {section.paragraphs.map((paragraph, index) => (
              <p key={index} className="mt-2 text-sm leading-relaxed text-ink/85">
                {loc(paragraph as Localized)}
              </p>
            ))}
          </section>
        ))}
      </Modal>
    </section>
  );
}
