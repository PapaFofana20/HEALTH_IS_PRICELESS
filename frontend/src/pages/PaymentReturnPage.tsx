import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { checkPaymentStatus } from '../services/saspay';
import { spaceSlug } from '../data/spaces';
import type { Goal, Plan } from '../types';

const PENDING_KEY = 'pending-payment';
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 3000;

/** Lit ?session_id= dans le hash (HashRouter) : repli si localStorage vidé. */
function sessionIdFromUrl(): string | null {
  try {
    const hash = window.location.hash;
    const queryIndex = hash.indexOf('?');
    if (queryIndex === -1) return null;
    return new URLSearchParams(hash.slice(queryIndex + 1)).get('session_id');
  } catch {
    return null;
  }
}

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

/**
 * Retour SasPay (return_url) : vérifie le statut auprès de SasPay
 * via notre backend. L'activation serveur (orders + profile.tier) est
 * assurée par le webhook ; ici on met à jour l'UI locale.
 */
export default function PaymentReturnPage() {
  const navigate = useNavigate();
  const { setTier, updateUser } = useAuth();
  const [state, setState] = useState<'loading' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;
    let sessionId: string | null = null;
    try {
      const raw = localStorage.getItem(PENDING_KEY);
      if (raw) {
        const pending = JSON.parse(raw) as { plan: Plan; goal: Goal; sessionId?: string };
        sessionId = pending.sessionId ?? null;
      }
    } catch {
      /* ignore */
    }
    sessionId ??= sessionIdFromUrl();
    if (!sessionId) {
      setState('error');
      return;
    }
    const id = sessionId;
    // Le webhook serveur peut arriver après le retour auto (3 s) : on re-tente
    // si SasPay répond encore PENDING. Les erreurs HTTP restent immédiates.
    void (async () => {
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
        try {
          const result = await checkPaymentStatus(id);
          const status = (result.status ?? '').toUpperCase();
          const txStatus = (result.transactionStatus ?? '').toUpperCase();
          if (status === 'PAID' || txStatus === 'SUCCESS') {
            // Le plan doit venir du backend : un repli sur localStorage ferait de
            // l'entrée 'pending-payment' une source de droit auto-servie.
            if (!result.plan || !result.goal) throw new Error('not-confirmed');
            const finalPlan = result.plan as Plan;
            const finalGoal = result.goal as Goal;
            if (cancelled) return;
            setTier(finalPlan);
            updateUser({ goal: finalGoal });
            localStorage.removeItem(PENDING_KEY);
            navigate(`/espace/${spaceSlug(finalPlan, finalGoal)}`, { replace: true });
            return;
          }
          if (attempt < MAX_ATTEMPTS) await wait(RETRY_DELAY_MS);
          else if (!cancelled) setState('error');
        } catch {
          if (!cancelled) setState('error');
          return;
        }
      }
    })();
    return () => {
      cancelled = true;
    };
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
