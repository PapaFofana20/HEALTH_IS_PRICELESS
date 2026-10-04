import { Router } from 'express';
import bcrypt from 'bcryptjs';
import cookie from 'cookie';
import { createToken, findUserByEmail, findUserById, createUser, getPublicUser, PASSWORD_RE } from '../services/userService.js';
import { authMiddleware } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rateLimit.js';

const router = Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const USE_SUPABASE = Boolean(SUPABASE_URL && SERVICE_KEY && !SERVICE_KEY.startsWith('colle-'));
const isProduction = process.env.NODE_ENV === 'production';

const loginAttempts = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [email, entry] of loginAttempts) {
    if (now - entry.last > 15 * 60 * 1000) loginAttempts.delete(email);
  }
}, 5 * 60 * 1000).unref();

function validatePassword(password) {
  if (!PASSWORD_RE.test(password)) {
    return 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial';
  }
  return null;
}

function getSupabaseHeaders() {
  return {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
  };
}

function setAuthCookie(res, token) {
  res.setHeader('Set-Cookie', cookie.serialize('auth_token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  }));
}

function clearAuthCookie(res) {
  res.setHeader('Set-Cookie', cookie.serialize('auth_token', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 0,
    path: '/',
  }));
}

function getAdminEmails() {
  const fromEnv = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);
  return fromEnv.length > 0 ? fromEnv : ['admin@hip.app', 'papafofana200@gmail.com'];
}

async function isAdminEmail(email) {
  if (!USE_SUPABASE) {
    return getAdminEmails().includes(email.trim().toLowerCase());
  }
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/admin_emails?email=eq.${encodeURIComponent(email.trim().toLowerCase())}&select=email`,
      { headers: getSupabaseHeaders() }
    );
    if (!res.ok) return false;
    const data = await res.json();
    return data.length > 0;
  } catch {
    return false;
  }
}

router.post('/register', authLimiter, async (req, res, next) => {
  try {
    const { firstName, email, password, goal } = req.body ?? {};
    if (!firstName?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ error: 'INVALID_INPUT', message: 'Prénom, email et mot de passe requis' });
    }
    if (!EMAIL_RE.test(email.trim())) {
      return res.status(400).json({ error: 'INVALID_INPUT', message: 'Format email invalide' });
    }
    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ error: 'INVALID_INPUT', message: passwordError });
    }
    const cleanEmail = email.trim().toLowerCase();
    if (await findUserByEmail(cleanEmail)) {
      return res.status(409).json({ error: 'EMAIL_EXISTS', message: 'Un compte existe déjà avec cet email' });
    }
    const cleanGoal = goal === 'muscle-gain' ? 'muscle-gain' : 'weight-loss';
    const user = await createUser({ firstName: firstName.trim(), email: cleanEmail, password, goal: cleanGoal, tier: 'free' });
    const token = createToken(user);
    setAuthCookie(res, token);
    res.status(201).json({ user: getPublicUser(user), token });
  } catch (err) {
    next(err);
  }
});

router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email?.trim() || !password || typeof password !== 'string') {
      return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Email ou mot de passe incorrect' });
    }
    const cleanEmail = email.trim().toLowerCase();
    const attempts = loginAttempts.get(cleanEmail);
    if (attempts?.count >= 5 && Date.now() - attempts.last < 15 * 60 * 1000) {
      return res.status(429).json({ error: 'ACCOUNT_LOCKED', message: 'Trop de tentatives, réessaie dans 15 minutes' });
    }
    const user = await findUserByEmail(cleanEmail);
    const passwordMatch = user ? await bcrypt.compare(password, user.passwordHash) : false;
    if (!user || !passwordMatch) {
      loginAttempts.set(cleanEmail, { count: (attempts?.count || 0) + 1, last: Date.now() });
      return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Email ou mot de passe incorrect' });
    }
    loginAttempts.delete(cleanEmail);
    const token = createToken(user);
    setAuthCookie(res, token);
    res.json({ user: getPublicUser(user), token });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', authMiddleware, (req, res) => {
  clearAuthCookie(res);
  res.json({ message: 'Déconnexion réussie' });
});

router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await findUserById(req.userId);
    if (!user) return res.status(404).json({ error: 'USER_NOT_FOUND' });
    res.json({ user: getPublicUser(user) });
  } catch (err) {
    next(err);
  }
});

router.get('/verify-admin', authMiddleware, async (req, res, next) => {
  try {
    const user = await findUserById(req.userId);
    if (!user) return res.status(404).json({ error: 'USER_NOT_FOUND' });
    const admin = await isAdminEmail(user.email);
    res.json({ admin });
  } catch (err) {
    next(err);
  }
});

/* Crée un administrateur (email + mot de passe) sans déconnecter l'admin
   courant : la création passe par l'API Admin Supabase (service_role).
   Le demandeur prouve son rôle via son token d'accès Supabase. */
router.post('/create-admin', authLimiter, async (req, res, next) => {
  try {
    if (!USE_SUPABASE) {
      return res.status(503).json({ error: 'NOT_CONFIGURED', message: 'Supabase requis pour créer un administrateur' });
    }
    const requester = await requireRequesterAdmin(req, res);
    if (!requester) return;
    void requester;

    const { firstName, email, password } = req.body ?? {};
    if (!email?.trim() || !password || typeof password !== 'string') {
      return res.status(400).json({ error: 'INVALID_INPUT', message: 'Email et mot de passe requis' });
    }
    if (!EMAIL_RE.test(email.trim())) {
      return res.status(400).json({ error: 'INVALID_INPUT', message: 'Format email invalide' });
    }
    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ error: 'INVALID_INPUT', message: passwordError });
    }
    const cleanEmail = email.trim().toLowerCase();
    const cleanFirstName = typeof firstName === 'string' && firstName.trim() ? firstName.trim() : cleanEmail.split('@')[0];

    // Compte déjà connu côté profils → simple promotion dans la whitelist.
    const existing = await findUserByEmail(cleanEmail);
    if (existing) {
      await addAdminEmail(cleanEmail);
      return res.json({ promoted: true, user: getPublicUser(existing) });
    }

    // 1. Compte Supabase Auth (email confirmé, pas de session créée pour l'admin courant).
    const createRes = await fetch(SUPABASE_URL + '/auth/v1/admin/users', {
      method: 'POST',
      headers: getSupabaseHeaders(),
      body: JSON.stringify({
        email: cleanEmail,
        password,
        email_confirm: true,
        user_metadata: { firstName: cleanFirstName },
      }),
    });
    if (!createRes.ok) {
      const errBody = await createRes.json().catch(() => ({}));
      const errMsg = String(errBody?.msg ?? errBody?.message ?? '');
      // Compte Auth existant sans profil : promotion dans la whitelist.
      if (createRes.status === 422 || createRes.status === 409 || /already|existe|registered/i.test(errMsg)) {
        await addAdminEmail(cleanEmail);
        return res.json({ promoted: true, email: cleanEmail });
      }
      return res.status(502).json({ error: 'AUTH_PROVIDER_ERROR', message: errMsg || 'Création du compte impossible' });
    }
    const created = await createRes.json();
    const authUserId = created?.id ?? created?.user?.id;
    if (!authUserId) {
      return res.status(502).json({ error: 'AUTH_PROVIDER_ERROR', message: 'Réponse inattendue du fournisseur' });
    }

    // 2. Ligne profil (même schéma que createUser, id = id Auth).
    const passwordHash = await bcrypt.hash(password, 10);
    const memberSince = new Date().toISOString().slice(0, 10);
    await fetch(SUPABASE_URL + '/rest/v1/profiles', {
      method: 'POST',
      headers: { ...getSupabaseHeaders(), Prefer: 'resolution=ignore-duplicates,return=minimal' },
      body: JSON.stringify({
        id: authUserId,
        email: cleanEmail,
        first_name: cleanFirstName,
        last_name: '',
        password_hash: passwordHash,
        avatar: '',
        tier: 'free',
        goal: 'weight-loss',
        current_program_id: null,
        current_week: 1,
        weight_goal: 72,
        member_since: memberSince,
        favorites: [],
      }),
    });

    // 3. Whitelist admin.
    await addAdminEmail(cleanEmail);

    res.status(201).json({ created: true, user: { id: authUserId, email: cleanEmail, firstName: cleanFirstName } });
  } catch (err) {
    next(err);
  }
});

async function addAdminEmail(email) {
  try {
    await fetch(SUPABASE_URL + '/rest/v1/admin_emails', {
      method: 'POST',
      headers: { ...getSupabaseHeaders(), Prefer: 'resolution=ignore-duplicates,return=minimal' },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });
  } catch {
    /* non bloquant : la création du compte a réussi */
  }
}

/* Vérifie que le demandeur (token Supabase) est admin. Retourne son email. */
async function requireRequesterAdmin(req, res) {
  const bearer = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null;
  if (!bearer) {
    res.status(401).json({ error: 'UNAUTHORIZED', message: 'Session requise' });
    return null;
  }
    try {
      const meRes = await fetch(SUPABASE_URL + '/auth/v1/user', {
        headers: { apikey: SERVICE_KEY, Authorization: 'Bearer ' + bearer },
      });
      if (!meRes.ok) {
        console.error('requireRequesterAdmin: GetUser rejeté', meRes.status);
        return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Session invalide ou expirée' });
      }
    const me = await meRes.json();
    const requesterEmail = me?.email ?? null;
    const requesterId = me?.id ?? null;
    if (!requesterEmail || !(await isAdminEmail(requesterEmail))) {
      res.status(403).json({ error: 'FORBIDDEN', message: 'Réservé aux administrateurs' });
      return null;
    }
    return { email: requesterEmail, id: requesterId };
  } catch {
    res.status(401).json({ error: 'UNAUTHORIZED', message: 'Session invalide ou expirée' });
    return null;
  }
}

/* Supprime définitivement un membre (compte Auth + profil + commandes).
   Refuse l'auto-suppression et la suppression d'un autre admin. */
router.delete('/members/:userId', authLimiter, async (req, res, next) => {
  try {
    if (!USE_SUPABASE) {
      return res.status(503).json({ error: 'NOT_CONFIGURED', message: 'Supabase requis pour supprimer un membre' });
    }
    const requester = await requireRequesterAdmin(req, res);
    if (!requester) return;
    const targetId = req.params.userId;
    if (!targetId || typeof targetId !== 'string') {
      return res.status(400).json({ error: 'INVALID_INPUT', message: 'Identifiant membre invalide' });
    }
    if (targetId === requester.id) {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Tu ne peux pas supprimer ton propre compte' });
    }
    const target = await findUserById(targetId);
    if (!target) return res.status(404).json({ error: 'USER_NOT_FOUND' });
    if (await isAdminEmail(target.email)) {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Impossible de supprimer un administrateur (retire-le d’abord de la whitelist)' });
    }

    const headers = getSupabaseHeaders();
    await fetch(SUPABASE_URL + '/rest/v1/orders?user_id=eq.' + encodeURIComponent(targetId), {
      method: 'DELETE',
      headers,
    });
    await fetch(SUPABASE_URL + '/rest/v1/profiles?id=eq.' + encodeURIComponent(targetId), {
      method: 'DELETE',
      headers,
    });
    const authDel = await fetch(SUPABASE_URL + '/auth/v1/admin/users/' + encodeURIComponent(targetId), {
      method: 'DELETE',
      headers,
    });
    if (!authDel.ok && authDel.status !== 404) {
      return res.status(502).json({ error: 'AUTH_PROVIDER_ERROR', message: 'Suppression du compte impossible' });
    }
    res.json({ deleted: true, email: target.email });
  } catch (err) {
    next(err);
  }
});

export { router as authRouter };
