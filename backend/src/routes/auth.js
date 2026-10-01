import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { createToken, findUserByEmail, findUserById, createUser, getPublicUser } from '../services/userService.js';
import { authMiddleware } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rateLimit.js';

const router = Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });

router.post('/register', authLimiter, async (req, res, next) => {
  try {
    const { firstName, email, password, goal, tier } = req.body ?? {};
    if (!firstName?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ error: 'INVALID_INPUT', message: 'Prénom, email et mot de passe requis' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'INVALID_INPUT', message: 'Le mot de passe doit contenir au moins 6 caractères' });
    }
    const cleanEmail = email.trim().toLowerCase();
    if (findUserByEmail(cleanEmail)) {
      return res.status(409).json({ error: 'EMAIL_EXISTS', message: 'Un compte existe déjà avec cet email' });
    }
    const cleanGoal = goal === 'muscle-gain' ? 'muscle-gain' : 'weight-loss';
    const cleanTier = tier === 'standard' || tier === 'premium' ? tier : 'free';
    const user = createUser({ firstName: firstName.trim(), email: cleanEmail, password, goal: cleanGoal, tier: cleanTier });
    const token = createToken(user);
    res.status(201).json({ token, user: getPublicUser(user) });
  } catch (err) {
    next(err);
  }
});

router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email?.trim() || !password) {
      return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Email ou mot de passe incorrect' });
    }
    const user = findUserByEmail(email.trim().toLowerCase());
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Email ou mot de passe incorrect' });
    }
    const token = createToken(user);
    res.json({ token, user: getPublicUser(user) });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', authMiddleware, (req, res) => {
  res.json({ message: 'Déconnexion réussie' });
});

router.get('/me', authMiddleware, (req, res) => {
  const user = findUserById(req.userId);
  if (!user) return res.status(404).json({ error: 'USER_NOT_FOUND' });
  res.json({ user: getPublicUser(user) });
});

export { router as authRouter };
