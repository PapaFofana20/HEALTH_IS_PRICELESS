import { Router } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { planPricing } from '../data/pricing.js';
import { authMiddleware } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rateLimit.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;

const paymentLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
const statusLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });

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

setInterval(() => {
  const now = Date.now();
  for (const [token, entry] of pendingPayments) {
    if (now - entry.createdAt > 60 * 60 * 1000) {
      pendingPayments.delete(token);
    }
  }
}, 15 * 60 * 1000).unref();

const USER_ID_RE = /^[a-zA-Z0-9_-]{3,64}$/;
const TOKEN_RE = /^[a-zA-Z0-9_-]{8,128}$/;

async function activatePlan({ userId, plan, amount, reference }) {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey || !userId || serviceKey.startsWith('colle-')) {
    if (process.env.NODE_ENV === 'production') {
      console.error('activatePlan: Supabase credentials or userId missing');
    }
    return false;
  }
  if (!USER_ID_RE.test(userId) || (plan !== 'standard' && plan !== 'premium')) {
    console.error('activatePlan: Invalid userId or plan');
    return false;
  }
  const cleanRef = String(reference || '').replace(/[^a-zA-Z0-9_-]/g, '');
  const headers = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
  };
  try {
    const orderRes = await fetch(`${url}/rest/v1/orders`, {
      method: 'POST',
      headers: { ...headers, Prefer: 'resolution=ignore-duplicates,return=minimal' },
      body: JSON.stringify({ user_id: userId, reference: cleanRef, plan, amount, method: 'card', status: 'paid' }),
    });
    if (!orderRes.ok) {
      console.error('activatePlan: Failed to create order in Supabase', await orderRes.text());
      return false;
    }
    const profileRes = await fetch(`${url}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ tier: plan }),
    });
    return profileRes.ok;
  } catch (err) {
    console.error('activatePlan failed:', err);
    return false;
  }
}

// POST /api/paytech/create-payment — initie un paiement PayTech (redirection).
router.post('/create-payment', paymentLimiter, async (req, res, next) => {
  try {
    if (!API_KEY || !API_SECRET) {
      return res.status(503).json({ error: 'NOT_CONFIGURED', message: 'Clés PayTech manquantes' });
    }
    const resolved = resolvePlan(req.body?.plan, req.body?.goal);
    if (!resolved) return res.status(400).json({ error: 'INVALID_INPUT', message: 'plan/goal invalides' });
    const { plan, goal, amount } = resolved;

    // Récupère userId depuis le corps de requête ou token Bearer si présent
    let userId = typeof req.body?.userId === 'string' && req.body.userId.trim() ? req.body.userId.trim() : null;
    if (req.headers.authorization?.startsWith('Bearer ')) {
      const token = req.headers.authorization.slice(7);
      // Vérifie le token JWT correctement (signature + expiration)
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded?.userId) {
          userId = decoded.userId;
        }
      } catch {
        /* token invalide ou expiré - on ignore et on utilise userId du body si présent */
      }
    }

    if (userId && !USER_ID_RE.test(userId)) {
      return res.status(400).json({ error: 'INVALID_INPUT', message: 'Identifiant utilisateur invalide' });
    }

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
    pendingPayments.set(data.token, { plan, goal, amount, userId, refCommand, createdAt: Date.now() });
    res.json({ token: data.token, redirectUrl: data.redirect_url ?? data.redirectUrl });
  } catch (err) {
    next(err);
  }
});

// GET /api/paytech/status/:token — vérifie le statut chez PayTech.
router.get('/status/:token', statusLimiter, async (req, res) => {
  try {
    if (!API_KEY || !API_SECRET) return res.status(503).json({ error: 'NOT_CONFIGURED' });
    const token = req.params.token;
    if (!token || !TOKEN_RE.test(token)) {
      return res.status(400).json({ error: 'INVALID_TOKEN' });
    }
    const known = pendingPayments.get(token);
    const response = await fetch(`${API_BASE}/payment/get-status?token_payment=${encodeURIComponent(token)}`, {
      headers: paytechHeaders(),
    });
    const data = await response.json();
    res.json({ ...data, plan: known?.plan, goal: known?.goal });
  } catch {
    res.status(502).json({ error: 'PAYTECH_ERROR' });
  }
});

function verifyIpn(body) {
  // Méthode 1 (recommandée par la doc) : HMAC-SHA256 sur les données de transaction.
  if (body.hmac_compute) {
    const message = `${body.final_item_price || body.item_price}|${body.ref_command}|${API_KEY}`;
    const expected = crypto.createHmac('sha256', API_SECRET).update(message).digest('hex');
    const expectedBuf = Buffer.from(expected, 'utf-8');
    const providedBuf = Buffer.from(String(body.hmac_compute), 'utf-8');
    if (expectedBuf.length === providedBuf.length && crypto.timingSafeEqual(expectedBuf, providedBuf)) return true;
  }
  // Méthode 2 (alternative) : SHA256 des clés API.
  if (body.api_key_sha256 && body.api_secret_sha256) {
    const keyHash = crypto.createHash('sha256').update(API_KEY).digest('hex');
    const secretHash = crypto.createHash('sha256').update(API_SECRET).digest('hex');
    const keyBuf = Buffer.from(keyHash, 'utf-8');
    const providedKeyBuf = Buffer.from(String(body.api_key_sha256), 'utf-8');
    const secretBuf = Buffer.from(secretHash, 'utf-8');
    const providedSecretBuf = Buffer.from(String(body.api_secret_sha256), 'utf-8');
    if (
      keyBuf.length === providedKeyBuf.length &&
      secretBuf.length === providedSecretBuf.length &&
      crypto.timingSafeEqual(keyBuf, providedKeyBuf) &&
      crypto.timingSafeEqual(secretBuf, providedSecretBuf)
    ) {
      return true;
    }
  }
  return false;
}

export { router as paytechRouter, verifyIpn, activatePlan, planPricing, pendingPayments };
