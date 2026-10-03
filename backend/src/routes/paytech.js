import express, { Router } from 'express';
import crypto from 'crypto';
import { planPricing } from '../data/pricing.js';

const router = Router();

const API_BASE = 'https://paytech.sn/api';
const API_KEY = process.env.PAYTECH_API_KEY;
const API_SECRET = process.env.PAYTECH_API_SECRET;
// test par défaut (sandbox) — jamais prod sans demande explicite.
const PAYTECH_ENV = process.env.PAYTECH_ENV === 'prod' ? 'prod' : 'test';

const appUrl = () => process.env.APP_URL ?? 'http://localhost:5173';

const paytechHeaders = () => ({
  Accept: 'application/json',
  'Content-Type': 'application/json',
  API_KEY,
  API_SECRET,
});

function resolvePlan(plan, goal) {
  if (plan !== 'standard' && plan !== 'premium') return null;
  if (goal !== 'weight-loss' && goal !== 'muscle-gain') return null;
  const amount = planPricing[goal]?.[plan]?.monthly;
  if (!Number.isFinite(amount)) return null;
  return { plan, goal, amount };
}

/* Tokens émis par /create-payment et leur plan associé (source de vérité
   côté serveur pour l'activation ; Map OK pour une instance unique). */
const pendingPayments = new Map();

async function activatePlan({ userId, plan, amount, reference }) {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey || !userId || serviceKey.startsWith('colle-')) return false;
  const headers = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
  };
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

// POST /api/paytech/create-payment — initie un paiement PayTech (redirection).
router.post('/create-payment', async (req, res, next) => {
  try {
    if (!API_KEY || !API_SECRET) {
      return res.status(503).json({ error: 'NOT_CONFIGURED', message: 'Clés PayTech manquantes' });
    }
    const resolved = resolvePlan(req.body?.plan, req.body?.goal);
    if (!resolved) return res.status(400).json({ error: 'INVALID_INPUT', message: 'plan/goal invalides' });
    const { plan, goal, amount } = resolved;
    const userId = typeof req.body?.userId === 'string' ? req.body.userId : null;
    const refCommand = `HIP-${plan.toUpperCase()}-${Date.now()}`;

    const response = await fetch(`${API_BASE}/payment/request-payment`, {
      method: 'POST',
      headers: paytechHeaders(),
      body: JSON.stringify({
        item_name: `Abonnement ${plan} — ${goal}`,
        item_price: amount,
        currency: 'XOF',
        ref_command: refCommand,
        command_name: `Abonnement ${plan} — ${goal}`,
        env: PAYTECH_ENV,
        ipn_url: `${process.env.PUBLIC_API_URL ?? appUrl()}/api/paytech/ipn`,
        success_url: `${appUrl()}/#/paiement/retour`,
        cancel_url: `${appUrl()}/#/tarifs?payment=cancelled`,
        custom_field: JSON.stringify({ userId, plan, goal, amount }),
      }),
    });
    const data = await response.json();
    if (data.success !== 1) {
      return res.status(502).json({ error: 'PAYTECH_ERROR', message: data.message ?? 'Erreur PayTech' });
    }
    pendingPayments.set(data.token, { plan, goal, amount, userId, refCommand });
    res.json({ token: data.token, redirectUrl: data.redirect_url ?? data.redirectUrl });
  } catch (err) {
    next(err);
  }
});

// GET /api/paytech/status/:token — vérifie le statut chez PayTech.
router.get('/status/:token', async (req, res) => {
  try {
    if (!API_KEY || !API_SECRET) return res.status(503).json({ error: 'NOT_CONFIGURED' });
    const response = await fetch(`${API_BASE}/payment/get-status?token_payment=${encodeURIComponent(req.params.token)}`, {
      headers: paytechHeaders(),
    });
    const data = await response.json();
    const known = pendingPayments.get(req.params.token);
    res.json({ ...data, plan: known?.plan, goal: known?.goal });
  } catch {
    res.status(502).json({ error: 'PAYTECH_ERROR' });
  }
});

function verifyIpn(body) {
  // Méthode 1 (recommandée par la doc) : HMAC-SHA256.
  if (body.hmac_compute) {
    const message = `${body.final_item_price || body.item_price}|${body.ref_command}|${API_KEY}`;
    const expected = crypto.createHmac('sha256', API_SECRET).update(message).digest('hex');
    if (expected === body.hmac_compute) return true;
  }
  // Méthode 2 (alternative) : SHA256 des clés.
  if (body.api_key_sha256 && body.api_secret_sha256) {
    const keyHash = crypto.createHash('sha256').update(API_KEY).digest('hex');
    const secretHash = crypto.createHash('sha256').update(API_SECRET).digest('hex');
    return keyHash === body.api_key_sha256 && secretHash === body.api_secret_sha256;
  }
  return false;
}

// POST /api/paytech/ipn — notification serveur-à-serveur de PayTech.
router.post('/ipn', express.json(), async (req, res) => {
  const body = req.body ?? {};
  if (!verifyIpn(body)) {
    return res.status(403).json({ error: 'FORBIDDEN', message: 'IPN non authentifiée' });
  }
  try {
    let custom = {};
    try {
      custom = JSON.parse(Buffer.from(body.custom_field ?? '', 'base64').toString('utf-8'));
    } catch {
      try { custom = JSON.parse(body.custom_field ?? '{}'); } catch { custom = {}; }
    }
    if (body.type_event === 'sale_complete') {
      const known = [...pendingPayments.entries()].find(([, v]) => v.refCommand === body.ref_command)?.[1];
      await activatePlan({
        userId: custom.userId ?? known?.userId ?? null,
        plan: custom.plan ?? known?.plan,
        amount: Number(body.final_item_price ?? body.item_price) || known?.amount,
        reference: body.ref_command ?? known?.refCommand,
      });
    }
  } catch {
    /* on accuse quand même réception */
  }
  res.json({ received: true });
});

export { router as paytechRouter };
