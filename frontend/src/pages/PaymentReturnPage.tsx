import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { checkPaymentStatus } from '../services/paytech';
import { spaceSlug } from '../data/spaces';
import type { Goal, Plan } from '../types';

const PENDING_KEY = 'pending-payment';

/**
 * Retour PayTech (success_url) : vérifie le statut auprès de PayTech
 * via notre backend. L'activation serveur (orders + profile.tier) est
 * assurée par l'IPN ; ici on met à jour l'UI locale.
 */
export default function PaymentReturnPage() {
  const navigate = useNavigate();
  const { setTier, updateUser } = useAuth();
  const [state, setState] = useState<'loading' | 'error'>('loading');

  useEffect(() => {
    let token: string | null = null;
    let plan: Plan | null = null;
    let goal: Goal | null = null;
    try {
      const raw = localStorage.getItem(PENDING_KEY);
      if (raw) {
        const pending = JSON.parse(raw) as { plan: Plan; goal: Goal; token?: string };
        plan = pending.plan;
        goal = pending.goal;
        token = pending.token ?? null;
      }
    } catch {
      /* ignore */
    }
    if (!token) {
      setState('error');
      return;
    }
    checkPaymentStatus(token)
      .then((result) => {
        const status = (result.status ?? result.type ?? '').toLowerCase();
        if (result.success !== 1 && status !== 'success' && status !== 'sale_complete' && status !== 'completed') {
          throw new Error('not-confirmed');
        }
        const finalPlan = (result.plan ?? plan) as Plan;
        const finalGoal = (result.goal ?? goal) as Goal;
        setTier(finalPlan);
        updateUser({ goal: finalGoal });
        localStorage.removeItem(PENDING_KEY);
        navigate(`/espace/${spaceSlug(finalPlan, finalGoal)}`, { replace: true });
      })
      .catch(() => setState('error'));
  }, [navigate, setTier, updateUser]);

  return (
    <main className="min-h-screen grid place-items-center bg-night-900 px-4 text-center">
      {state === 'loading' ? (
        <p className="text-muted">Vérification du paiement…</p>
      ) : (
        <div>
          <p className="font-display text-2xl uppercase text-volt">Paiement non confirmé</p>
          <p className="mt-2 text-muted">Le paiement n'a pas pu être vérifié. Contacte le support si le montant a été débité.</p>
          <button type="button" onClick={() => navigate('/tarifs')} className="mt-6 underline text-volt">
            Retour aux tarifs
          </button>
        </div>
      )}
    </main>
  );
}
