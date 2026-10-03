import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Crown } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import { planPricing } from '../data/programs';
import { createPayment } from '../services/paytech';
import { Button } from '../components/ui/Button';
import type { Goal, Plan } from '../types';

const PENDING_KEY = 'pending-payment';

/** Récapitulatif avant redirection vers PayTech. */
export default function PaymentPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { t, fmtPrice } = useLanguage();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const rawPlan = params.get('plan') ?? 'standard';
  const rawGoal = params.get('goal') ?? 'weight-loss';
  const plan: Plan = rawPlan === 'premium' ? 'premium' : rawPlan === 'standard' ? 'standard' : 'standard';
  const goal: Goal = rawGoal === 'muscle-gain' ? 'muscle-gain' : rawGoal === 'weight-loss' ? 'weight-loss' : 'weight-loss';
  const hasInvalidParams = (params.get('plan') !== null && rawPlan !== 'standard' && rawPlan !== 'premium') ||
    (params.get('goal') !== null && rawGoal !== 'weight-loss' && rawGoal !== 'muscle-gain');
  const price = planPricing[goal]?.[plan];

  const pay = async () => {
    if (hasInvalidParams || price === undefined) {
      setError('Formule invalide. Retourne aux tarifs pour choisir une offre.');
      return;
    }
    if (!user) {
      navigate(`/connexion?mode=register&plan=${plan}&goal=${goal}`);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const { token, redirectUrl } = await createPayment(plan, goal, user?.id);
      try {
        localStorage.setItem(PENDING_KEY, JSON.stringify({ plan, goal, token }));
      } catch {
        /* ignore */
      }
      window.location.assign(redirectUrl);
    } catch (err) {
      setError(`Le service de paiement est indisponible. (${err instanceof Error ? err.message : 'erreur réseau'})`);
      setLoading(false);
    }
  };

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-night-900 px-4 py-24 grid place-items-center">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 pattern-grid fade-mask-radial" />
      <div className="relative w-full max-w-md rounded-2xl border border-edge bg-night-800 p-8 text-center">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-volt">Récapitulatif</p>
        <h1 className="mt-3 font-display text-4xl uppercase">
          {plan === 'premium' ? t.plans.premium.name : t.plans.standard.name}
        </h1>
        <p className="mt-2 text-muted">
          {plan === 'premium' && <Crown className="inline h-4 w-4 text-volt" />} {goal === 'weight-loss' ? t.goals['weight-loss'] : t.goals['muscle-gain']}
        </p>
        {price !== undefined && (
          <>
            <p className="mt-6 font-display text-5xl">
              {fmtPrice(price.annual)} <span className="text-base text-muted">{t.plans.perYear}</span>
            </p>
            <p className="mt-1 text-sm font-semibold text-muted">
              {t.plans.monthlyEquiv(fmtPrice(price.monthlyEquivalent))}
            </p>
          </>
        )}
        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        <Button size="lg" fullWidth className="mt-8" onClick={pay} disabled={loading}>
          {loading ? 'Redirection…' : 'Procéder au paiement'}
        </Button>
        <button type="button" onClick={() => navigate('/tarifs')} className="mt-4 text-sm text-muted underline underline-offset-4">
          Retour aux tarifs
        </button>
      </div>
    </main>
  );
}
