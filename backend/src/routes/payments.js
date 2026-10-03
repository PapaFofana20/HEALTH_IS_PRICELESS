import express, { Router } from 'express';
import { planPricing } from '../data/pricing.js';

const router = Router();

const PAYDUNYA_SANDBOX = (process.env.PAYDUNYA_SANDBOX ?? 'true') !== 'false';
const API_BASE = PAYDUNYA_SANDBOX
  ? 'https://app.paydunya.com/sandbox-api/v1'
  : 'https://app.paydunya.com/api/v1';

const keys = {
  masterKey: process.env.PAYDUNYA_MASTER_KEY,
  privateKey: process.env.PAYDUNYA_PRIVATE_KEY,
  token: process.env.PAYDUNYA_TOKEN,
};

const isConfigured = () => Boolean(keys.masterKey && keys.privateKey && keys.token);
const mockEnabled = () => process.env.PAYDUNYA_MOCK === 'true' || (!isConfigured() && process.env.NODE_ENV !== 'production');

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

router.post('/create-invoice', async (req, res, next) => {
  try {
    const resolved = resolvePlan(req.body?.plan, req.body?.goal);
    if (!resolved) return res.status(400).json({ error: 'INVALID_INPUT', message: 'plan/goal invalides' });
    const { plan, goal, amount } = resolved;

    if (mockEnabled()) {
      const token = `mock-${Date.now()}`;
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
    res.json({ invoiceToken: data.token, checkoutUrl: data.url ?? data.response_text });
  } catch (err) {
    next(err);
  }
});

router.get('/verify/:token', async (req, res) => {
  const { token } = req.params;
  const plan = req.query.plan;
  const goal = req.query.goal;
  if (mockEnabled() && token.startsWith('mock-')) {
    return res.json({ status: 'completed', plan, goal });
  }
  if (!isConfigured()) return res.status(503).json({ error: 'NOT_CONFIGURED' });
  try {
    const response = await fetch(`${API_BASE}/checkout-invoice/confirm/${token}`, { headers: dunyaHeaders() });
    const data = await response.json();
    const completed = data.status === 'completed';
    res.json({ status: completed ? 'completed' : data.status ?? 'unknown', plan: data.custom_data?.plan ?? plan, goal: data.custom_data?.goal ?? goal });
  } catch {
    res.status(502).json({ error: 'PAYDUNYA_ERROR' });
  }
});

router.post('/ipn', express.json(), (req, res) => {
  // PayDunya notifie ici en POST; on accuse réception. La validation
  // réelle se fait via /verify avant d'activer l'abonnement.
  res.json({ received: true });
});

export { router as paymentsRouter };
