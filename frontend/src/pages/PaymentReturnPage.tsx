import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { verifyInvoice } from '../services/payments';
import { spaceSlug } from '../data/spaces';
import type { Goal, Plan } from '../types';

const PENDING_KEY = 'pending-payment';

/** Landing page PayDunya return URL : vérifie l'invoice puis active le plan. */
export default function PaymentReturnPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setTier, updateUser } = useAuth();
  const [state, setState] = useState<'loading' | 'error'>('loading');

  useEffect(() => {
    const token = params.get('token');
    let plan = params.get('plan') as Plan | null;
    let goal = params.get('goal') as Goal | null;
    try {
      const raw = localStorage.getItem(PENDING_KEY);
      if (raw) {
        const pending = JSON.parse(raw) as { plan: Plan; goal: Goal };
        plan = plan ?? pending.plan;
        goal = goal ?? pending.goal;
      }
    } catch {
      /* ignore */
    }
    if (!token) {
      setState('error');
      return;
    }
    verifyInvoice(token)
      .then((result) => {
        if (result.status !== 'completed') throw new Error('not-completed');
        const finalPlan = (result.plan ?? plan) as Plan;
        const finalGoal = (result.goal ?? goal) as Goal;
        setTier(finalPlan);
        updateUser({ goal: finalGoal });
        localStorage.removeItem(PENDING_KEY);
        navigate(`/espace/${spaceSlug(finalPlan, finalGoal)}`, { replace: true });
      })
      .catch(() => setState('error'));
  }, [params, navigate, setTier, updateUser]);

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

export function storePendingPayment(plan: Plan, goal: Goal) {
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify({ plan, goal }));
  } catch {
    /* ignore */
  }
}
