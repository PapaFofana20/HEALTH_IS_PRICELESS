import { useState } from 'react';
import type { FormEvent } from 'react';
import { useLanguage } from '../../../../hooks/useLanguage';
import { useAuth, isValidEmail } from '../../../../hooks/useAuth';
import { Button } from '../../../ui/Button';
import { ViewHeader } from '../DashboardLayout';
import type { User } from '../../../../types';

const labelClass = 'text-[11px] font-extrabold uppercase tracking-[0.18em] text-muted';

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  className?: string;
}

function Field({ id, label, value, onChange, type = 'text', autoComplete, className }: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        className="mt-3 h-12 w-full min-w-0 rounded-xl border border-edge bg-night-900 px-4 text-sm font-semibold text-ink transition-colors focus:border-volt focus:outline-none"
      />
    </div>
  );
}

export function ProfileView({ user, onNotice }: { user: User; onNotice: (message: string) => void }) {
  const { t, fmtDate } = useLanguage();
  const { tier, updateUser } = useAuth();
  const [form, setForm] = useState({ firstName: user.firstName, lastName: user.lastName, email: user.email });
  const [error, setError] = useState<string | null>(null);

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.firstName.trim()) {
      setError(t.auth.errors.firstName);
      return;
    }
    if (!isValidEmail(form.email)) {
      setError(t.auth.errors.email);
      return;
    }
    setError(null);
    updateUser({ firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email.trim() });
    onNotice(t.dashboard.settings.saved);
  };

  return (
    <div className="min-w-0 space-y-8 sm:space-y-10">
      <ViewHeader title={t.dashboard.profile.title} subtitle={t.dashboard.profile.subtitle} />

      <div className="grid min-w-0 gap-6 sm:gap-8 lg:grid-cols-2">
        <section className="h-fit min-w-0 rounded-2xl border border-edge/70 bg-night-800/70 p-6 transition-colors duration-300 hover:border-edge-strong sm:p-8">
          <div className="flex items-center gap-5">
            <img src={user.avatar} alt="" className="h-20 w-20 shrink-0 rounded-full object-cover ring-2 ring-volt/60" />
            <div className="min-w-0">
              <p className="truncate font-display text-2xl uppercase leading-none tracking-tight">
                {user.firstName} {user.lastName}
              </p>
              <p className="mt-2 truncate text-sm leading-relaxed text-muted">{user.email}</p>
            </div>
          </div>
          <dl className="mt-8 grid gap-3 sm:grid-cols-3 sm:gap-4">
            <div className="min-w-0 rounded-2xl border border-edge/70 bg-night-900/70 p-5">
              <dt className={labelClass}>{t.dashboard.tierLabel}</dt>
              <dd className="mt-2.5 font-display text-xl uppercase leading-none tracking-tight">
                <span className={tier === 'premium' ? 'text-volt' : 'text-ink'}>{t.tiers[tier]}</span>
              </dd>
            </div>
            <div className="min-w-0 rounded-2xl border border-edge/70 bg-night-900/70 p-5">
              <dt className={labelClass}>{t.dashboard.profile.goal}</dt>
              <dd className="mt-2.5 font-display text-xl uppercase leading-none tracking-tight">{t.goals[user.goal]}</dd>
            </div>
            <div className="min-w-0 rounded-2xl border border-edge/70 bg-night-900/70 p-5">
              <dt className={labelClass}>{t.dashboard.profile.memberSince}</dt>
              <dd className="mt-2.5 font-display text-xl uppercase leading-none tracking-tight">
                {fmtDate(user.memberSince, { day: 'numeric', month: 'short', year: 'numeric' })}
              </dd>
            </div>
          </dl>
        </section>

        <form onSubmit={save} noValidate className="h-fit min-w-0 rounded-2xl border border-edge/70 bg-night-800/70 p-6 transition-colors duration-300 hover:border-edge-strong sm:p-8">
          <h2 className="font-display text-2xl uppercase leading-none tracking-tight">{t.dashboard.settings.profile}</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 sm:gap-6">
            <Field
              id="profile-first-name"
              label={t.dashboard.settings.firstName}
              value={form.firstName}
              autoComplete="given-name"
              onChange={(value) => setForm((current) => ({ ...current, firstName: value }))}
            />
            <Field
              id="profile-last-name"
              label={t.dashboard.settings.lastName}
              value={form.lastName}
              autoComplete="family-name"
              onChange={(value) => setForm((current) => ({ ...current, lastName: value }))}
            />
            <Field
              id="profile-email"
              type="email"
              className="sm:col-span-2"
              label={t.dashboard.settings.email}
              value={form.email}
              autoComplete="email"
              onChange={(value) => setForm((current) => ({ ...current, email: value }))}
            />
          </div>
          {error && (
            <p role="alert" className="mt-4 text-sm font-semibold leading-relaxed text-danger">
              {error}
            </p>
          )}
          <Button type="submit" className="mt-8 h-12 w-full px-8 sm:w-auto">
            {t.common.save}
          </Button>
        </form>
      </div>
    </div>
  );
}
