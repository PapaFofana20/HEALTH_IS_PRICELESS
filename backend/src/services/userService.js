import 'dotenv/config';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/* Service utilisateur via Supabase Postgres (table public.profiles).
   Utilise la clé service-role pour contourner RLS (côté serveur uniquement).
   Voir supabase/migrations/0001_profiles.sql pour le schéma. */

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET manquant : définis-le dans backend/.env');
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const USE_SUPABASE = Boolean(SUPABASE_URL && SERVICE_KEY && !SERVICE_KEY.startsWith('colle-'));

const users = new Map();

// Demo user only for local development (not test/staging)
const isLocalDev = process.env.NODE_ENV === 'development' && !process.env.CI;
if (isLocalDev) {
  const demoUser = {
    id: 'demo-alex',
    firstName: 'Alex',
    lastName: 'Martin',
    email: 'alex@hip.app',
    passwordHash: bcrypt.hashSync('demo123', 10),
    avatar: 'https://randomuser.me/api/portraits/men/36.jpg',
    tier: 'standard',
    goal: 'weight-loss',
    currentProgramId: 'lean-and-strong',
    currentWeek: 6,
    weightGoal: 76,
    memberSince: '2025-11-03',
    favorites: ['muscle-builder', 'hiit-shred'],
  };
  users.set(demoUser.id, demoUser);
}

function secureRandomInt(max) {
  const buf = crypto.randomBytes(4);
  return buf.readUInt32BE(0) % max;
}

function getSupabaseHeaders() {
  return {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
  };
}

function mapProfileToUser(profile) {
  return {
    id: profile.id,
    firstName: profile.first_name ?? '',
    lastName: profile.last_name ?? '',
    email: profile.email ?? '',
    passwordHash: profile.password_hash ?? '',
    avatar: profile.avatar ?? '',
    tier: profile.tier ?? 'free',
    goal: profile.goal ?? 'weight-loss',
    currentProgramId: profile.current_program_id ?? null,
    currentWeek: profile.current_week ?? 1,
    weightGoal: profile.weight_goal ?? (profile.goal === 'weight-loss' ? 72 : 80),
    memberSince: profile.member_since ?? new Date().toISOString().slice(0, 10),
    favorites: Array.isArray(profile.favorites) ? profile.favorites : [],
  };
}

export function createToken(user) {
  return jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export async function findUserByEmail(email) {
  const cleanEmail = email.trim().toLowerCase();

  if (!USE_SUPABASE) {
    for (const user of users.values()) {
      if (user.email === cleanEmail) return user;
    }
    return null;
  }

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(cleanEmail)}&select=*`,
      { headers: getSupabaseHeaders() }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data[0] ? mapProfileToUser(data[0]) : null;
  } catch {
    return null;
  }
}

export async function findUserById(id) {
  if (!USE_SUPABASE) {
    return users.get(id) || null;
  }

  if (!id || id.startsWith('user-')) return null;

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(id)}&select=*`,
      { headers: getSupabaseHeaders() }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data[0] ? mapProfileToUser(data[0]) : null;
  } catch {
    return null;
  }
}

const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,128}$/;

function validatePassword(password) {
  if (!PASSWORD_RE.test(password)) {
    throw new Error('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial');
  }
}

export async function createUser({ firstName, email, password, goal, tier }) {
  // Validate password complexity
  validatePassword(password);
  
  const cleanEmail = email.trim().toLowerCase();
  const cleanGoal = goal === 'muscle-gain' ? 'muscle-gain' : 'weight-loss';
  const cleanTier = tier || 'free';
  const passwordHash = await bcrypt.hash(password, 10);
  const avatar = `https://randomuser.me/api/portraits/${secureRandomInt(2) === 0 ? 'men' : 'women'}/${secureRandomInt(99)}.jpg`;
  const memberSince = new Date().toISOString().slice(0, 10);

  if (!USE_SUPABASE) {
    const id = `user-${uuidv4()}`;
    const user = {
      id,
      firstName: firstName.trim(),
      lastName: '',
      email: cleanEmail,
      passwordHash,
      avatar,
      tier: cleanTier,
      goal: cleanGoal,
      currentProgramId: null,
      currentWeek: 1,
      weightGoal: cleanGoal === 'weight-loss' ? 72 : 80,
      memberSince,
      favorites: [],
    };
    users.set(id, user);
    return user;
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: 'POST',
      headers: { ...getSupabaseHeaders(), Prefer: 'return=representation' },
      body: JSON.stringify({
        id: crypto.randomUUID(),
        email: cleanEmail,
        first_name: firstName.trim(),
        last_name: '',
        password_hash: passwordHash,
        avatar,
        tier: cleanTier,
        goal: cleanGoal,
        current_program_id: null,
        current_week: 1,
        weight_goal: cleanGoal === 'weight-loss' ? 72 : 80,
        member_since: memberSince,
        favorites: [],
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Supabase create user failed: ${err}`);
    }
    const data = await res.json();
    return mapProfileToUser(data[0]);
  } catch (err) {
    console.error('createUser error:', err);
    throw err;
  }
}

const UPDATABLE = ['firstName', 'lastName', 'goal', 'currentProgramId', 'currentWeek', 'weightGoal', 'favorites'];

export async function updateUser(id, updates) {
  if (!USE_SUPABASE) {
    const user = users.get(id);
    if (!user) return null;
    for (const key of UPDATABLE) {
      if (updates[key] !== undefined) user[key] = updates[key];
    }
    return user;
  }

  const patch = {};
  if (updates.firstName !== undefined) patch.first_name = updates.firstName.trim();
  if (updates.lastName !== undefined) patch.last_name = updates.lastName.trim();
  if (updates.goal !== undefined) patch.goal = updates.goal;
  if (updates.currentProgramId !== undefined) patch.current_program_id = updates.currentProgramId;
  if (updates.currentWeek !== undefined) patch.current_week = updates.currentWeek;
  if (updates.weightGoal !== undefined) patch.weight_goal = updates.weightGoal;
  if (updates.favorites !== undefined) patch.favorites = updates.favorites;

  if (Object.keys(patch).length === 0) {
    return findUserById(id);
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { ...getSupabaseHeaders(), Prefer: 'return=representation' },
      body: JSON.stringify(patch),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data[0] ? mapProfileToUser(data[0]) : null;
  } catch {
    return null;
  }
}

export function getPublicUser(user) {
  const { passwordHash, ...publicUser } = user;
  return publicUser;
}