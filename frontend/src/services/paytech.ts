import type { Goal, Plan } from '../types';

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3001';

export interface PayTechInvoice {
  token: string;
  redirectUrl: string;
}

export async function createPayment(plan: Plan, goal: Goal, userId?: string): Promise<PayTechInvoice> {
  const res = await fetch(`${API_URL}/api/paytech/create-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan, goal, userId }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message ?? 'PAYMENT_ERROR');
  return data as PayTechInvoice;
}

export async function checkPaymentStatus(token: string) {
  const res = await fetch(`${API_URL}/api/paytech/status/${token}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message ?? 'STATUS_ERROR');
  return data as { success?: number; status?: string; type?: string; plan?: Plan; goal?: Goal };
}
