import { Router } from 'express';
import bcrypt from 'bcryptjs';
import cookie from 'cookie';
import { createToken, findUserByEmail, findUserById, createUser, getPublicUser } from '../services/userService.js';
import { authMiddleware } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rateLimit.js';

const router = Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,128}$/;

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
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  }));
}

function clearAuthCookie(res) {
  res.setHeader('Set-Cookie', cookie.serialize('auth_token', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  }));
}

async function isAdminEmail(email) {
  if (!USE_SUPABASE) {
    const adminEmails = ['admin@hip.app', 'papafofana200@gmail.com'];
    return adminEmails.includes(email.trim().toLowerCase());
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
    res.status(201).json({ user: getPublicUser(user) });
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
    res.json({ user: getPublicUser(user) });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', authMiddleware, (req, res) => {
  clearAuthCookie(res);
  res.json({ message: 'Déconnexion réussie' });
});

router.get('/me', authMiddleware, async (req, res) => {
  const user = await findUserById(req.userId);
  if (!user) return res.status(404).json({ error: 'USER_NOT_FOUND' });
  res.json({ user: getPublicUser(user) });
});

router.get('/verify-admin', authMiddleware, async (req, res) => {
  const user = await findUserById(req.userId);
  if (!user) return res.status(404).json({ error: 'USER_NOT_FOUND' });
  const admin = await isAdminEmail(user.email);
  res.json({ admin });
});

export { router as authRouter };
