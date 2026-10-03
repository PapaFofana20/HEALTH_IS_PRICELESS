import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Crown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { planPricing } from '../data/programs';
import { createInvoice } from '../services/payments';
import { storePendingPayment } from './PaymentReturnPage';
import { Button } from '../components/ui/Button';
import type { Goal, Plan } from '../types';

/** Récapitulatif avant redirection vers PayDunya. */
export default function PaymentPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { t, fmtPrice } = useLanguage();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const plan = (params.get('plan') ?? 'standard') as Plan;
  const goal = (params.get('goal') ?? 'weight-loss') as Goal;
  const price = planPricing[goal]?.[plan]?.monthly;

  const pay = async () => {
    setError(null);
    setLoading(true);
    storePendingPayment(plan, goal);
    try {
      const { checkoutUrl } = await createInvoice(plan, goal, user?.id);
      window.location.assign(checkoutUrl);
    } catch (err) {
      setError(`Le service de paiement est indisponible pour le moment. Réessaie plus tard. (${err instanceof Error ? err.message : 'erreur réseau'})`);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-night-900 px-4 py-24 grid place-items-center">
      <div className="w-full max-w-md rounded-2xl border border-edge bg-night-800 p-8 text-center">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-volt">Récapitulatif</p>
        <h1 className="mt-3 font-display text-4xl uppercase">
          {plan === 'premium' ? t.plans.premium.name : t.plans.standard.name}
        </h1>
        <p className="mt-2 text-muted">{plan === 'premium' && <Crown className="inline h-4 w-4 text-volt" />} {goal === 'weight-loss' ? t.goals['weight-loss'] : t.goals['muscle-gain']}</p>
        {price !== undefined && (
          <p className="mt-6 font-display text-5xl">
            {fmtPrice(price)} <span className="text-base text-muted">{t.plans.perMonth}</span>
          </p>
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
