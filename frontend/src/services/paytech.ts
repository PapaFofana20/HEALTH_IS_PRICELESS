import type { Goal, Plan } from '../types';

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3001';

export interface PayTechInvoice {
  token: string;
  redirectUrl: string;
}

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  return fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}

export async function createPayment(plan: Plan, goal: Goal, userId?: string): Promise<PayTechInvoice> {
  const res = await fetchWithAuth(`${API_URL}/api/paytech/create-payment`, {
    method: 'POST',
    body: JSON.stringify({ plan, goal, userId }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message ?? 'PAYMENT_ERROR');
  return data as PayTechInvoice;
}

export async function checkPaymentStatus(token: string) {
  const res = await fetchWithAuth(`${API_URL}/api/paytech/status/${encodeURIComponent(token)}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message ?? 'STATUS_ERROR');
  return data as { success?: number; status?: string; type?: string; plan?: Plan; goal?: Goal };
}