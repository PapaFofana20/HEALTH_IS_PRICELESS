import { Router } from 'express';
import crypto from 'crypto';
import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import { planPricing } from '../data/pricing.js';
import { findUserById } from '../services/userService.js';
import { rateLimit } from '../middleware/rateLimit.js';

/* Encaissement via SasPay (https://docs.saspay.me) : checkout heberge
   (redirection) + webhook transaction.success + polling de statut.
   Facturation annuelle unique (planPricing[].annual, FCFA). */

const router = Router();

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET manquant');
  return secret;
}

const API_BASE = 'https://api.saspay.me/api/v1';
const API_KEY = process.env.SASPAY_API_KEY;

const appUrl = () => process.env.APP_URL ?? 'http://localhost:5173';

const saspayHeaders = () => ({
  Accept: 'application/json',
  'Content-Type': 'application/json',
  Authorization: 'Bearer ' + API_KEY,
});

function resolvePlan(plan, goal) {
  if (plan !== 'standard' && plan !== 'premium') return null;
  if (goal !== 'weight-loss' && goal !== 'muscle-gain') return null;
  const amount = planPricing[goal]?.[plan]?.annual;
  if (!Number.isFinite(amount)) return null;
  return { plan, goal, amount };
}

/* SasPay enveloppe ses réponses : { success, data, code }.
   unwrap() accepte les deux formes (enveloppe ou objet direct). */
function unwrap(json) {
  if (json && typeof json === 'object' && 'data' in json && (json?.success === true || json?.data)) return json.data;
  return json;
}

const pendingPayments = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [sessionId, entry] of pendingPayments) {
    if (now - entry.createdAt > 60 * 60 * 1000) {
      pendingPayments.delete(sessionId);
    }
  }
}, 15 * 60 * 1000).unref();

const USER_ID_RE = /^[a-zA-Z0-9_-]{3,64}$/;
const SESSION_ID_RE = /^[A-Za-z0-9_-]{8,128}$/;

function supabaseHeaders(serviceKey) {
  return {
    apikey: serviceKey,
    Authorization: 'Bearer ' + serviceKey,
    'Content-Type': 'application/json',
  };
}

/* Persiste le paiement en attente (resilience au redemarrage). */
async function savePendingOrder({ userId, plan, goal, amount, reference }) {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey || serviceKey.startsWith('colle-')) return;
  try {
    await fetch(url + '/rest/v1/orders', {
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
      }),
    });
  } catch (err) {
    console.error('savePendingOrder failed:', err);
  }
}

/* Repli : retrouve un paiement perdu apres redemarrage via Supabase. */
async function findPendingOrderByReference(reference) {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey || serviceKey.startsWith('colle-') || !reference) return null;
  try {
    const res = await fetch(
      url + '/rest/v1/orders?reference=eq.' + encodeURIComponent(reference) + '&select=user_id,plan,goal,amount,status',
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
  const headers = supabaseHeaders(serviceKey);
  try {
    const orderRes = await fetch(url + '/rest/v1/orders', {
      method: 'POST',
      headers: { ...headers, Prefer: 'resolution=ignore-duplicates,return=minimal' },
      body: JSON.stringify({ user_id: userId, reference: cleanRef, plan, amount, method: 'card', status: 'paid' }),
    });
    if (!orderRes.ok) {
      console.error('activatePlan: Failed to create order in Supabase', await orderRes.text());
      return false;
    }
    const profileRes = await fetch(url + '/rest/v1/profiles?id=eq.' + encodeURIComponent(userId), {
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

/* ---------- Webhook SasPay : verification HMAC ----------
   Signature = hex(HMAC-SHA256(secret, timestamp + '.' + corps brut)),
   horodatage tolere a +/- 5 minutes (anti-rejeu). */
const WEBHOOK_TOLERANCE_S = 300;

export function verifyWebhookSignature(rawBody, signature, timestamp) {
  const secret = process.env.SASPAY_WEBHOOK_SECRET;
  if (!secret || !signature || !timestamp) return false;
  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > WEBHOOK_TOLERANCE_S) return false;
  const expected = crypto.createHmac('sha256', secret).update(timestamp + '.' + rawBody).digest('hex');
  const provided = Buffer.from(String(signature), 'utf-8');
  const wanted = Buffer.from(expected, 'utf-8');
  return provided.length === wanted.length && crypto.timingSafeEqual(provided, wanted);
}

function findPendingByTransactionId(transactionId) {
  for (const [sessionId, entry] of pendingPayments.entries()) {
    if (entry.transactionId === transactionId) return { sessionId, entry };
  }
  return null;
}

/* Repli : le webhook peut arriver avant tout polling (onglet ferme).
   On recherche la session via l'API SasPay et on lit ses metadata. */
async function findSessionByTransactionId(transactionId) {
  try {
    const listRes = await fetch(API_BASE + '/checkout-sessions/?limit=25', { headers: saspayHeaders() });
    if (!listRes.ok) return null;
    const list = unwrap(await listRes.json());
    const sessions = Array.isArray(list) ? list : (list.results ?? list.data ?? []);
    for (const session of sessions) {
      if (!session?.id || session.status !== 'PAID') continue;
      const detailRes = await fetch(API_BASE + '/checkout-sessions/' + encodeURIComponent(session.id) + '/', {
        headers: saspayHeaders(),
      });
      if (!detailRes.ok) continue;
      const detail = unwrap(await detailRes.json());
      if (detail?.transaction === transactionId || detail?.transaction_id === transactionId) return detail;
    }
  } catch (err) {
    console.error('findSessionByTransactionId failed:', err);
  }
  return null;
}

/* Traite un event transaction.success (webhook). Retourne true si active. */
export async function processTransactionSuccess(data) {
  const transactionId = data?.id;
  let known = null;
  let sessionId = null;

  if (transactionId) {
    const hit = findPendingByTransactionId(transactionId);
    if (hit) {
      known = hit.entry;
      sessionId = hit.sessionId;
    }
  }
  if (!known && transactionId) {
    const detail = await findSessionByTransactionId(transactionId);
    const meta = detail?.metadata ?? {};
    const metaAmount = planPricing[meta.goal]?.[meta.plan]?.annual;
    if (detail && typeof meta.userId === 'string' && (meta.plan === 'standard' || meta.plan === 'premium') && (meta.goal === 'weight-loss' || meta.goal === 'muscle-gain') && Number.isFinite(metaAmount)) {
      known = { plan: meta.plan, goal: meta.goal, amount: metaAmount, userId: meta.userId, refCommand: meta.ref ?? detail.id };
      sessionId = detail.id;
    }
  }
  if (!known) {
    console.error('SasPay webhook: transaction inconnue (' + (transactionId ?? 'absente') + ') — activation refusee');
    return false;
  }

  const expectedAmount = planPricing[known.goal]?.[known.plan]?.annual;
  const charged = Number(data?.charged ?? data?.amount);
  if (!Number.isFinite(expectedAmount) || !Number.isFinite(charged) || charged < expectedAmount) {
    console.error('SasPay webhook: montant ' + charged + ' inferieur a lattendu ' + expectedAmount);
    return false;
  }

  const ok = await activatePlan({
    userId: known.userId,
    plan: known.plan,
    amount: charged,
    reference: known.refCommand,
  });
  if (ok && sessionId) pendingPayments.delete(sessionId);
  return ok;
}

/* ---------- Routes ---------- */
const paymentLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
const statusLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });

// POST /api/saspay/create-payment — cree une session de checkout SasPay.
router.post('/create-payment', paymentLimiter, async (req, res, next) => {
  try {
    if (!API_KEY) {
      return res.status(503).json({ error: 'NOT_CONFIGURED', message: 'Clé SasPay manquante' });
    }
    const resolved = resolvePlan(req.body?.plan, req.body?.goal);
    if (!resolved) return res.status(400).json({ error: 'INVALID_INPUT', message: 'plan/goal invalides' });
    const { plan, goal, amount } = resolved;

    // Session backend si presente (ne bloque pas si absente).
    let sessionUserId = req.userId ?? null;
    if (!sessionUserId && req.headers.cookie) {
      try {
        const cookies = cookie.parse(req.headers.cookie);
        if (cookies.auth_token) {
          const decoded = jwt.verify(cookies.auth_token, getJwtSecret());
          if (decoded?.userId) sessionUserId = decoded.userId;
        }
      } catch {
        /* cookie invalide : on continue sans session */
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
    if (sessionUserId && bodyUserId && bodyUserId !== sessionUserId) {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Identifiant utilisateur incohérent' });
    }
    const userId = sessionUserId ?? bodyUserId;
    if (!userId || !USER_ID_RE.test(userId)) {
      return res.status(400).json({ error: 'INVALID_INPUT', message: 'Identifiant utilisateur invalide' });
    }

    // SasPay exige email + nom : lus sur le compte (anti-spoof passif).
    const account = await findUserById(userId);
    if (!account) {
      return res.status(400).json({ error: 'INVALID_INPUT', message: 'Compte introuvable — connecte-toi avant de payer' });
    }

    const refCommand = 'HIP-' + plan.toUpperCase() + '-' + Date.now() + '-' + crypto.randomUUID().slice(0, 8);
    const customerName = ((account.firstName ?? '') + ' ' + (account.lastName ?? '')).trim() || account.email;

    const response = await fetch(API_BASE + '/checkout-sessions/', {
      method: 'POST',
      headers: saspayHeaders(),
      body: JSON.stringify({
        amount: amount.toFixed(2),
        currency: 'XOF',
        description: 'Abonnement ' + plan + ' — ' + goal,
        country: 'SN',
        customer_email: account.email,
        customer_name: customerName,
        return_url: appUrl() + '/#/paiement/retour',
        metadata: { userId, plan, goal, ref: refCommand },
      }),
    });
    const data = await response.json().catch(() => ({}));
    const session = unwrap(data);
    if (!response.ok || !session?.id || !session?.checkout_url) {
      console.error('create-payment: SasPay error', response.status, data);
      return res.status(502).json({ error: 'SASPAY_ERROR', message: session?.message ?? data?.message ?? 'Erreur SasPay' });
    }

    pendingPayments.set(session.id, { plan, goal, amount, userId, refCommand, transactionId: null, createdAt: Date.now() });
    void savePendingOrder({ userId, plan, goal, amount, reference: refCommand });

    const redirectUrl = safeRedirectUrl(session.checkout_url);
    if (!redirectUrl) {
      pendingPayments.delete(session.id);
      console.error('create-payment: redirectUrl SasPay rejetée (protocole ou hôte non autorisé)');
      return res.status(502).json({ error: 'SASPAY_ERROR', message: 'URL de redirection rejetée' });
    }
    res.json({ sessionId: session.id, redirectUrl });
  } catch (err) {
    next(err);
  }
});

// GET /api/saspay/status/:sessionId — statut verifie cote SasPay (+ activation si paye).
router.get('/status/:sessionId', statusLimiter, async (req, res) => {
  try {
    if (!API_KEY) return res.status(503).json({ error: 'NOT_CONFIGURED' });
    const sessionId = req.params.sessionId;
    if (!sessionId || !SESSION_ID_RE.test(sessionId)) {
      return res.status(400).json({ error: 'INVALID_SESSION' });
    }
    const response = await fetch(API_BASE + '/checkout-sessions/' + encodeURIComponent(sessionId) + '/status/', {
      headers: saspayHeaders(),
    });
    if (response.status === 404) return res.status(404).json({ error: 'UNKNOWN_SESSION' });
    if (!response.ok) return res.status(502).json({ error: 'SASPAY_ERROR' });
    const data = unwrap(await response.json().catch(() => ({})));

    let known = pendingPayments.get(sessionId) ?? null;
    if (data?.transaction_id && known) known.transactionId = data.transaction_id;

    const paid = data?.status === 'PAID' || data?.transaction_status === 'SUCCESS';
    if (paid && !known) {
      // Redemarrage : relit les metadata SasPay pour activer quand meme.
      try {
        const detailRes = await fetch(API_BASE + '/checkout-sessions/' + encodeURIComponent(sessionId) + '/', {
          headers: saspayHeaders(),
        });
        if (detailRes.ok) {
          const detail = unwrap(await detailRes.json());
          const meta = detail?.metadata ?? {};
          const metaAmount = planPricing[meta.goal]?.[meta.plan]?.annual;
          if (typeof meta.userId === 'string' && (meta.plan === 'standard' || meta.plan === 'premium') && (meta.goal === 'weight-loss' || meta.goal === 'muscle-gain') && Number.isFinite(metaAmount)) {
            known = { plan: meta.plan, goal: meta.goal, amount: metaAmount, userId: meta.userId, refCommand: meta.ref ?? sessionId, transactionId: data?.transaction_id ?? null, createdAt: Date.now() };
            pendingPayments.set(sessionId, known);
          }
        }
      } catch (err) {
        console.error('status: session detail failed:', err);
      }
    }
    if (paid && known) {
      const ok = await activatePlan({
        userId: known.userId,
        plan: known.plan,
        amount: known.amount,
        reference: known.refCommand,
      });
      if (ok) pendingPayments.delete(sessionId);
    }

    res.json({ status: data?.status ?? null, transactionStatus: data?.transaction_status ?? null, plan: known?.plan ?? null, goal: known?.goal ?? null });
  } catch {
    res.status(502).json({ error: 'SASPAY_ERROR' });
  }
});

/* La redirection est consommee par window.location.assign cote client : une
   URL non validee ouvrirait une page de phishing au milieu du paiement. */
function safeRedirectUrl(value) {
  try {
    const url = new URL(String(value ?? ''));
    if (url.protocol !== 'https:') return null;
    const host = url.hostname.toLowerCase();
    const allowed = process.env.SASPAY_ALLOWED_REDIRECT_HOSTS
      ?.split(',')
      .map((h) => h.trim().toLowerCase())
      .filter(Boolean);
    if (allowed?.length) return allowed.includes(host) ? url.toString() : null;
    return /(^|\.)saspay\.me$/.test(host) ? url.toString() : null;
  } catch {
    return null;
  }
}

export { router as saspayRouter, planPricing, pendingPayments };