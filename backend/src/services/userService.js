import 'dotenv/config';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

/* Comptes mock locaux (dev). La persistance réelle est dans
   Supabase Postgres (table public.profiles, voir
   supabase/migrations/0001_profiles.sql). */

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET manquant : définis-le dans backend/.env');
}
const users = new Map();

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

export function findUserByEmail(email) {
  for (const user of users.values()) {
    if (user.email === email) return user;
  }
  return null;
}

export function findUserById(id) {
  return users.get(id) || null;
}

export function createUser({ firstName, email, password, goal, tier }) {
  const id = `user-${uuidv4()}`;
  const passwordHash = bcrypt.hashSync(password, 10);
  const user = {
    id,
    firstName,
    lastName: '',
    email,
    passwordHash,
    avatar: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 99)}.jpg`,
    tier: tier || 'free',
    goal: goal || 'weight-loss',
    currentProgramId: null,
    currentWeek: 1,
    weightGoal: goal === 'weight-loss' ? 72 : 80,
    memberSince: new Date().toISOString().slice(0, 10),
    favorites: [],
  };
  users.set(id, user);
  return user;
}

const UPDATABLE = ['firstName', 'lastName', 'tier', 'goal', 'currentProgramId', 'currentWeek', 'weightGoal', 'favorites'];

export function updateUser(id, updates) {
  const user = users.get(id);
  if (!user) return null;
  for (const key of UPDATABLE) {
    if (updates[key] !== undefined) user[key] = updates[key];
  }
  return user;
}

export function getPublicUser(user) {
  const { passwordHash, ...publicUser } = user;
  return publicUser;
}
