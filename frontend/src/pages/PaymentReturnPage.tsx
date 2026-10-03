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
    try {
      const raw = localStorage.getItem(PENDING_KEY);
      if (raw) {
        const pending = JSON.parse(raw) as { plan: Plan; goal: Goal; token?: string };
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
        // Le plan doit venir du backend : un repli sur localStorage ferait de
        // l'entrée 'pending-payment' une source de droit auto-servie.
        if (!result.plan || !result.goal) throw new Error('not-confirmed');
        const finalPlan = result.plan as Plan;
        const finalGoal = result.goal as Goal;
        setTier(finalPlan);
        updateUser({ goal: finalGoal });
        localStorage.removeItem(PENDING_KEY);
        navigate(`/espace/${spaceSlug(finalPlan, finalGoal)}`, { replace: true });
      })
      .catch(() => setState('error'));
  }, [navigate, setTier, updateUser]);

  return (
    <main className="relative isolate min-h-screen overflow-hidden grid place-items-center bg-night-900 px-4 text-center">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 pattern-grid fade-mask-radial" />
      <div className="relative">
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
      </div>
    </main>
  );
}
