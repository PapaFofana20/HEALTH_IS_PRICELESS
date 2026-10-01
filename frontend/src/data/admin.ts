import type { Goal, Tier } from '../types';

/* ==========================================================
   Back-office mock dataset (admin demo).
   Replace with real API calls when the backend is ready.
   ========================================================== */

export type MemberStatus = 'active' | 'trial' | 'expired';
export type OrderStatus = 'paid' | 'pending' | 'failed';
export type PayMethod = 'wave' | 'orange' | 'mtn' | 'card';

export interface AdminMember {
  id: string;
  name: string;
  email: string;
  tier: Tier;
  goal: Goal;
  status: MemberStatus;
  sessions: number;
  program: string;
  joined: string; // ISO date
}

export interface AdminOrder {
  id: string;
  reference: string;
  member: string;
  plan: Exclude<Tier, 'free'>;
  amount: number; // XOF
  method: PayMethod;
  status: OrderStatus;
  date: string; // ISO date
}

export const adminMembers: AdminMember[] = [
  { id: 'm1', name: 'Awa Diop', email: 'awa.diop@example.com', tier: 'premium', goal: 'weight-loss', status: 'active', sessions: 34, program: 'Lean & Strong', joined: '2025-11-03' },
  { id: 'm2', name: 'Moussa Diallo', email: 'moussa.diallo@example.com', tier: 'premium', goal: 'muscle-gain', status: 'active', sessions: 41, program: 'Muscle Builder', joined: '2025-10-18' },
  { id: 'm3', name: 'Fatou Ndiaye', email: 'fatou.ndiaye@example.com', tier: 'standard', goal: 'weight-loss', status: 'active', sessions: 22, program: 'Fat Burn Starter', joined: '2025-12-01' },
  { id: 'm4', name: 'Cheikh Sarr', email: 'cheikh.sarr@example.com', tier: 'standard', goal: 'muscle-gain', status: 'trial', sessions: 5, program: 'Home Hypertrophy', joined: '2026-02-10' },
  { id: 'm5', name: 'Mariama Bah', email: 'mariama.bah@example.com', tier: 'free', goal: 'weight-loss', status: 'trial', sessions: 3, program: '—', joined: '2026-02-14' },
  { id: 'm6', name: 'Ibrahima Sow', email: 'ibrahima.sow@example.com', tier: 'premium', goal: 'muscle-gain', status: 'active', sessions: 28, program: 'Strength & Mass', joined: '2025-09-27' },
  { id: 'm7', name: 'Aïda Koné', email: 'aida.kone@example.com', tier: 'standard', goal: 'weight-loss', status: 'expired', sessions: 12, program: 'Transformation 30', joined: '2025-08-15' },
  { id: 'm8', name: 'Ousmane Traoré', email: 'ousmane.traore@example.com', tier: 'free', goal: 'muscle-gain', status: 'trial', sessions: 1, program: '—', joined: '2026-02-18' },
];

export const adminOrders: AdminOrder[] = [
  { id: 'o1', reference: 'HIP-9K2M4Q', member: 'Awa Diop', plan: 'premium', amount: 16393, method: 'wave', status: 'paid', date: '2026-02-16' },
  { id: 'o2', reference: 'HIP-7H1N8P', member: 'Moussa Diallo', plan: 'premium', amount: 16393, method: 'orange', status: 'paid', date: '2026-02-15' },
  { id: 'o3', reference: 'HIP-5T4R2W', member: 'Fatou Ndiaye', plan: 'standard', amount: 8521, method: 'mtn', status: 'paid', date: '2026-02-12' },
  { id: 'o4', reference: 'HIP-3F8G6H', member: 'Cheikh Sarr', plan: 'standard', amount: 8521, method: 'wave', status: 'pending', date: '2026-02-18' },
  { id: 'o5', reference: 'HIP-2D5J9K', member: 'Ibrahima Sow', plan: 'premium', amount: 16393, method: 'card', status: 'paid', date: '2026-02-10' },
  { id: 'o6', reference: 'HIP-1B7L3M', member: 'Aïda Koné', plan: 'standard', amount: 6556, method: 'orange', status: 'failed', date: '2026-02-08' },
];

export const adminRevenueByMonth = [
  { month: 'Sep', revenue: 42 },
  { month: 'Oct', revenue: 58 },
  { month: 'Nov', revenue: 51 },
  { month: 'Déc', revenue: 74 },
  { month: 'Jan', revenue: 69 },
  { month: 'Fév', revenue: 88 },
];

export const adminSignupsByMonth = [
  { month: 'Sep', signups: 18 },
  { month: 'Oct', signups: 26 },
  { month: 'Nov', signups: 22 },
  { month: 'Déc', signups: 34 },
  { month: 'Jan', signups: 31 },
  { month: 'Fév', signups: 42 },
];
