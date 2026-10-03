import { Router } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { planPricing } from '../data/pricing.js';
import { rateLimit } from '../middleware/rateLimit.js';

const router = Router();

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET manquant');
  return secret;
}

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
const TOKEN_RE = /^[A-Za-z0-9_.-]{6,256}$/;

function supabaseHeaders(serviceKey) {
  return {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
  };
}

/* Persiste le paiement en attente (résilience au redémarrage).
   Fire-and-forget : un échec n'empêche pas la redirection PayTech,
   la Map mémoire reste la source primaire. */
async function savePendingOrder({ userId, plan, goal, amount, reference, token }) {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey || serviceKey.startsWith('colle-')) return;
  try {
    await fetch(`${url}/rest/v1/orders`, {
      method: 'POST',
      headers: { ...supabaseHeaders(serviceKey), Prefer: 'resolution=ignore-duplicates,return=minimal' },
      body: JSON.stringify({
        user_id: userId ?? null,
        reference,
        plan,
        goal,
        amount,
        method: 'card',
        status: 'pending',
        paytech_token: token,
      }),
    });
  } catch (err) {
    console.error('savePendingOrder failed:', err);
  }
}

/* Repli IPN : retrouve un paiement perdu après redémarrage via Supabase. */
async function findPendingOrderByReference(reference) {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey || serviceKey.startsWith('colle-') || !reference) return null;
  try {
    const res = await fetch(
      `${url}/rest/v1/orders?reference=eq.${encodeURIComponent(reference)}&select=user_id,plan,goal,amount,status`,
      { headers: supabaseHeaders(serviceKey) },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data[0] ?? null;
  } catch {
    return null;
  }
}

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
// Auth optionnelle : si une session backend existe (cookie/Bearer), elle fait
// foi et le body ne peut pas imposer un autre userId. Sinon (Supabase/mock
// côté front, sans session backend), on accepte le userId du body validé.
router.post('/create-payment', paymentLimiter, async (req, res, next) => {
  try {
    if (!API_KEY || !API_SECRET) {
      return res.status(503).json({ error: 'NOT_CONFIGURED', message: 'Clés PayTech manquantes' });
    }
    const resolved = resolvePlan(req.body?.plan, req.body?.goal);
    if (!resolved) return res.status(400).json({ error: 'INVALID_INPUT', message: 'plan/goal invalides' });
    const { plan, goal, amount } = resolved;

    // Session backend si présente (ne bloque pas si absente).
    let sessionUserId = req.userId ?? null;
    if (!sessionUserId && req.headers.cookie) {
      try {
        const cookies = cookie.parse(req.headers.cookie);
        if (cookies.auth_token) {
          const decoded = jwt.verify(cookies.auth_token, getJwtSecret());
          if (decoded?.userId) sessionUserId = decoded.userId;
        }
      } catch {
        /* cookie invalide : on continue sans session, le body fera foi */
      }
    }
    if (!sessionUserId && req.headers.authorization?.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(req.headers.authorization.slice(7), getJwtSecret());
        if (decoded?.userId) sessionUserId = decoded.userId;
      } catch {
        return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Token invalide ou expiré' });
      }
    }
    const bodyUserId =
      typeof req.body?.userId === 'string' && req.body.userId.trim() ? req.body.userId.trim() : null;

    // Si les deux sont présents, ils doivent correspondre (anti-spoof).
    if (sessionUserId && bodyUserId && bodyUserId !== sessionUserId) {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Identifiant utilisateur incohérent' });
    }
    const userId = sessionUserId ?? bodyUserId;

    if (!userId || !USER_ID_RE.test(userId)) {
      return res.status(400).json({ error: 'INVALID_INPUT', message: 'Identifiant utilisateur invalide' });
    }

    const refCommand = `HIP-${plan.toUpperCase()}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

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
    void savePendingOrder({ userId, plan, goal, amount, reference: refCommand, token: data.token });
    const redirectUrl = safeRedirectUrl(data.redirect_url ?? data.redirectUrl);
    if (!redirectUrl) {
      pendingPayments.delete(data.token);
      console.error('create-payment: redirectUrl PayTech rejetée (protocole ou hôte non autorisé)');
      return res.status(502).json({ error: 'PAYTECH_ERROR', message: 'URL de redirection rejetée' });
    }
    res.json({ token: data.token, redirectUrl });
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
  // HMAC-SHA256 sur les données de transaction (méthode de la doc PayTech).
  // La méthode alternative par hachage des clés API est volontairement
  // retirée : api_secret_sha256 est une valeur STATIQUE transmise dans chaque
  // IPN, donc quiconque en intercepte une pourrait forger des IPN
  // indéfiniment et reformerait la méthode 1.
  if (!body.hmac_compute || !API_SECRET) return false;
  const message = `${body.final_item_price || body.item_price}|${body.ref_command}|${API_KEY}`;
  const expected = crypto.createHmac('sha256', API_SECRET).update(message).digest('hex');
  const expectedBuf = Buffer.from(expected, 'utf-8');
  const providedBuf = Buffer.from(String(body.hmac_compute), 'utf-8');
  return expectedBuf.length === providedBuf.length && crypto.timingSafeEqual(expectedBuf, providedBuf);
}

/* La redirection est consommée par window.location.assign côté client : une
   URL non validée ouvrirait une page de phishing au milieu du paiement. */
function safeRedirectUrl(value) {
  try {
    const url = new URL(String(value ?? ''));
    if (url.protocol !== 'https:') return null;
    const host = url.hostname.toLowerCase();
    const allowed = process.env.PAYTECH_ALLOWED_REDIRECT_HOSTS
      ?.split(',')
      .map((h) => h.trim().toLowerCase())
      .filter(Boolean);
    if (allowed?.length) return allowed.includes(host) ? url.toString() : null;
    return /(^|\.)paytech\.sn$/.test(host) ? url.toString() : null;
  } catch {
    return null;
  }
}

export { router as paytechRouter, verifyIpn, activatePlan, findPendingOrderByReference, planPricing, pendingPayments };
