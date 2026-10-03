import express, { Router } from 'express';
import { planPricing } from '../data/pricing.js';

const router = Router();

// En production le défaut est LIVE : sandbox exige PAYDUNYA_SANDBOX=true explicite.
const PAYDUNYA_SANDBOX = process.env.PAYDUNYA_SANDBOX === 'true';
const API_BASE = PAYDUNYA_SANDBOX
  ? 'https://app.paydunya.com/sandbox-api/v1'
  : 'https://app.paydunya.com/api/v1';

const keys = {
  masterKey: process.env.PAYDUNYA_MASTER_KEY,
  privateKey: process.env.PAYDUNYA_PRIVATE_KEY,
  token: process.env.PAYDUNYA_TOKEN,
};

const isConfigured = () => Boolean(keys.masterKey && keys.privateKey && keys.token);
// Le mock n'est jamais actif automatiquement : uniquement si explicitement demandé.
const mockEnabled = () => process.env.PAYDUNYA_MOCK === 'true';

function dunyaHeaders() {
  return {
    'PAYDUNYA-MASTER-KEY': keys.masterKey,
    'PAYDUNYA-PRIVATE-KEY': keys.privateKey,
    'PAYDUNYA-TOKEN': keys.token,
    'Content-Type': 'application/json',
  };
}

function resolvePlan(plan, goal) {
  if (plan !== 'standard' && plan !== 'premium') return null;
  if (goal !== 'weight-loss' && goal !== 'muscle-gain') return null;
  const amount = planPricing[goal]?.[plan]?.monthly;
  if (!Number.isFinite(amount)) return null;
  return { plan, goal, amount };
}

/* Tokens émis par /create-invoice → source de vérité plan/goal/montant.
   (Map en mémoire : OK pour une instance unique ; passer à Redis sinon.) */
const pendingInvoices = new Map();

/** Active l'abonnement dans Supabase (service-role) après vérif PayDunya. */
async function activatePlan({ userId, plan, amount, reference }) {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey || !userId) return false;
  const headers = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
    Prefer: 'return=minimal',
  };
  // Commande marquée payée (le client ne peut plus rien insérer côté orders).
  await fetch(`${url}/rest/v1/orders`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'resolution=ignore-duplicates,return=minimal' },
    body: JSON.stringify({ user_id: userId, reference, plan, amount, method: 'card', status: 'paid' }),
  }).catch(() => {});
  await fetch(`${url}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ tier: plan }),
  }).catch(() => {});
  return true;
}

router.post('/create-invoice', async (req, res, next) => {
  try {
    const resolved = resolvePlan(req.body?.plan, req.body?.goal);
    if (!resolved) return res.status(400).json({ error: 'INVALID_INPUT', message: 'plan/goal invalides' });
    const { plan, goal, amount } = resolved;
    const userId = typeof req.body?.userId === 'string' ? req.body.userId : null;

    if (mockEnabled()) {
      const token = `mock-${Date.now()}`;
      pendingInvoices.set(token, { plan, goal, amount, userId });
      const returnUrl = req.body?.returnUrl ?? 'http://localhost:5173/#/paiement/retour';
      return res.json({ invoiceToken: token, checkoutUrl: `${returnUrl}${returnUrl.includes('?') ? '&' : '?'}token=${token}&mock=1` });
    }
    if (!isConfigured()) return res.status(503).json({ error: 'NOT_CONFIGURED', message: 'Clés PayDunya manquantes' });

    const appUrl = process.env.APP_URL ?? 'http://localhost:5173';
    const payload = {
      invoice: {
        total_amount: amount,
        description: `Abonnement ${plan} — ${goal}`,
      },
      store: { name: process.env.PAYDUNYA_MERCHANT_NAME ?? 'HEALTH IS PRICELESS' },
      actions: {
        cancel_url: `${appUrl}/#/tarifs?payment=cancelled`,
        return_url: `${appUrl}/#/paiement/retour`,
        callback_url: process.env.PAYDUNYA_CALLBACK_URL ?? undefined,
      },
      custom_data: { plan, goal },
    };
    const response = await fetch(`${API_BASE}/checkout-invoice/create`, {
      method: 'POST',
      headers: dunyaHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (data.response_code !== '00') {
      return res.status(502).json({ error: 'PAYDUNYA_ERROR', message: data.response_text ?? 'Erreur PayDunya' });
    }
    pendingInvoices.set(data.token, { plan, goal, amount, userId });
    res.json({ invoiceToken: data.token, checkoutUrl: data.url ?? data.response_text });
  } catch (err) {
    next(err);
  }
});

async function confirmWithPayDunya(token) {
  const response = await fetch(`${API_BASE}/checkout-invoice/confirm/${token}`, { headers: dunyaHeaders() });
  return response.json();
}

router.get('/verify/:token', async (req, res) => {
  const { token } = req.params;
  const known = pendingInvoices.get(token);
  try {
    if (mockEnabled() && token.startsWith('mock-')) {
      if (known) await activatePlan({ userId: known.userId, plan: known.plan, amount: known.amount, reference: token });
      return res.json({ status: 'completed', plan: known?.plan, goal: known?.goal, activated: true });
    }
    if (!isConfigured()) return res.status(503).json({ error: 'NOT_CONFIGURED' });
    const data = await confirmWithPayDunya(token);
    const completed = (data.status ?? '').toLowerCase() === 'completed';
    if (!completed) return res.json({ status: data.status ?? 'unknown' });

    // Source de vérité plan/goal/montant : l'invoice créée côté serveur.
    // Fallback : custom_data de PayDunya, avec montant cohérent avec le plan.
    let plan = known?.plan;
    let goal = known?.goal;
    let amount = known?.amount;
    if (!plan || !goal) {
      const cp = data.custom_data?.plan;
      const cg = data.custom_data?.goal;
      const resolved = resolvePlan(cp, cg);
      if (!resolved) return res.status(409).json({ error: 'UNKNOWN_INVOICE', message: 'Invoice non reconnue' });
      ({ plan, goal, amount } = resolved);
    }
    const invoiceAmount = Number(data.total_amount ?? data.invoice?.total_amount);
    if (Number.isFinite(invoiceAmount) && invoiceAmount !== amount) {
      return res.status(409).json({ error: 'AMOUNT_MISMATCH', message: 'Montant inattendu' });
    }
    const activated = await activatePlan({ userId: known?.userId ?? null, plan, amount, reference: token });
    pendingInvoices.delete(token);
    res.json({ status: 'completed', plan, goal, activated });
  } catch {
    res.status(502).json({ error: 'PAYDUNYA_ERROR' });
  }
});

// PayDunya poste en application/x-www-form-urlencoded avec clé "data".
router.post('/ipn', express.urlencoded({ extended: true }), async (req, res) => {
  try {
    const payload = typeof req.body?.data === 'string' ? JSON.parse(req.body.data) : req.body?.data ?? req.body;
    const token = payload?.invoice?.token ?? payload?.token;
    // L'IPN n'est qu'un signal : la validation réelle passe par l'API de confirmation.
    if (token && isConfigured()) await confirmWithPayDunya(token);
  } catch {
    /* on accuse toujours réception */
  }
  res.json({ received: true });
});

export { router as paymentsRouter };
