import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, LogOut } from 'lucide-react';
import { cn } from '../../../../utils/cn';
import { useLanguage } from '../../../../hooks/useLanguage';
import { useAuth } from '../../../../hooks/useAuth';
import { LanguageSwitcher } from '../../../layout/LanguageSwitcher';
import { Button } from '../../../ui/Button';
import { ConfirmDialog } from '../../../ui/ConfirmDialog';
import { ViewHeader } from '../DashboardLayout';
import type { Tier } from '../../../../types';

export function SettingsView({ onNotice }: { onNotice: (message: string) => void }) {
  const { t } = useLanguage();
  const { tier, setTier, logout } = useAuth();
  const navigate = useNavigate();
  const [confirmLogout, setConfirmLogout] = useState(false);
  // En dev uniquement : le changement de formule est local et immédiat.
  // En production, on passe par le paiement.
  const isDev = import.meta.env.DEV;

  const changeTier = (next: Tier) => {
    setTier(next);
    onNotice(t.dashboard.settings.tierChanged(t.tiers[next]));
  };

  return (
    <div className="min-w-0 space-y-8 sm:space-y-10">
      <ViewHeader title={t.dashboard.settings.title} subtitle={t.dashboard.settings.subtitle} />
      <div className="grid min-w-0 gap-6 sm:gap-8 lg:grid-cols-2">
        <section className="h-fit min-w-0 rounded-2xl border border-edge/70 bg-night-800/70 p-6 transition-colors duration-300 hover:border-edge-strong sm:p-8">
          <h2 className="font-display text-2xl uppercase leading-none tracking-tight">{t.dashboard.settings.subscription}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {isDev ? t.dashboard.settings.subscriptionText : t.dashboard.settings.subscriptionLive}
          </p>
          <div role="group" aria-label={t.dashboard.settings.subscription} className="mt-6 grid grid-cols-2 gap-3">
            {(['standard', 'premium'] as Tier[]).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={tier === option}
                onClick={() => (isDev ? changeTier(option) : navigate(`/paiement?plan=${option}`))}
                className={cn(
                  'flex h-24 min-w-0 flex-col items-center justify-center gap-2 rounded-2xl border text-[11px] font-extrabold uppercase tracking-[0.18em] transition-colors duration-200',
                  tier === option ? 'border-volt bg-volt/10 text-volt' : 'border-edge text-muted hover:border-edge-strong hover:text-ink',
                )}
              >
                {option === 'premium' ? <Crown className="h-4 w-4" aria-hidden /> : <span className="h-4" aria-hidden />}
                {t.tiers[option]}
              </button>
            ))}
          </div>
        </section>

        <div className="min-w-0 space-y-6 sm:space-y-8">
          <section className="min-w-0 rounded-2xl border border-edge/70 bg-night-800/70 p-6 transition-colors duration-300 hover:border-edge-strong sm:p-8">
            <h2 className="font-display text-2xl uppercase leading-none tracking-tight">{t.dashboard.settings.language}</h2>
            <LanguageSwitcher className="mt-6" />
          </section>
          <section className="min-w-0 rounded-2xl border border-edge/70 bg-night-800/70 p-6 transition-colors duration-300 hover:border-edge-strong sm:p-8">
            <h2 className="font-display text-2xl uppercase leading-none tracking-tight">{t.dashboard.settings.session}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{t.dashboard.settings.logoutText}</p>
            <Button
              variant="outline"
              className="mt-6 h-12 px-6"
              icon={<LogOut />}
              onClick={() => setConfirmLogout(true)}
            >
              {t.dashboard.logout}
            </Button>
          </section>
        </div>
      </div>
      <ConfirmDialog
        open={confirmLogout}
        title={t.dashboard.logoutConfirmTitle}
        text={t.dashboard.logoutConfirmText}
        onConfirm={() => {
          setConfirmLogout(false);
          logout();
          navigate('/');
        }}
        onClose={() => setConfirmLogout(false)}
      />
    </div>
  );
}