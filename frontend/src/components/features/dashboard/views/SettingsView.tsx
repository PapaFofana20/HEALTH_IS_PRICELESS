import { useNavigate } from 'react-router-dom';
import { Crown, LogOut } from 'lucide-react';
import { cn } from '../../../../utils/cn';
import { useLanguage } from '../../../../hooks/useLanguage';
import { useAuth } from '../../../../hooks/useAuth';
import { LanguageSwitcher } from '../../../layout/LanguageSwitcher';
import { Button } from '../../../ui/Button';
import { ViewHeader } from '../DashboardLayout';
import type { Tier } from '../../../../types';

export function SettingsView({ onNotice }: { onNotice: (message: string) => void }) {
  const { t } = useLanguage();
  const { tier, setTier, logout } = useAuth();
  const navigate = useNavigate();

  const changeTier = (next: Tier) => {
    setTier(next);
    onNotice(t.dashboard.settings.tierChanged(t.tiers[next]));
  };

  return (
    <div className="space-y-6">
      <ViewHeader title={t.dashboard.settings.title} subtitle={t.dashboard.settings.subtitle} />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="h-fit rounded-xl border border-edge bg-night-800 p-6">
          <h2 className="font-display text-2xl uppercase">{t.dashboard.settings.subscription}</h2>
          <p className="mt-1 text-sm text-muted">{t.dashboard.settings.subscriptionText}</p>
          <div role="group" aria-label={t.dashboard.settings.subscription} className="mt-5 grid grid-cols-2 gap-2">
            {(['standard', 'premium'] as Tier[]).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={tier === option}
                onClick={() => changeTier(option)}
                className={cn(
                  'flex h-20 flex-col items-center justify-center gap-1.5 rounded-xl border text-[11px] font-extrabold uppercase tracking-[0.12em] transition-colors duration-200',
                  tier === option ? 'border-volt bg-volt/10 text-volt' : 'border-edge text-muted hover:border-edge-strong hover:text-ink',
                )}
              >
                {option === 'premium' ? <Crown className="h-4 w-4" aria-hidden /> : <span className="h-4" aria-hidden />}
                {t.tiers[option]}
              </button>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-xl border border-edge bg-night-800 p-6">
            <h2 className="font-display text-2xl uppercase">{t.dashboard.settings.language}</h2>
            <LanguageSwitcher className="mt-4" />
          </section>
          <section className="rounded-xl border border-edge bg-night-800 p-6">
            <h2 className="font-display text-2xl uppercase">{t.dashboard.settings.session}</h2>
            <p className="mt-1 text-sm text-muted">{t.dashboard.settings.logoutText}</p>
            <Button
              variant="outline"
              className="mt-4"
              icon={<LogOut />}
              onClick={() => {
                logout();
                navigate('/');
              }}
            >
              {t.dashboard.logout}
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
}