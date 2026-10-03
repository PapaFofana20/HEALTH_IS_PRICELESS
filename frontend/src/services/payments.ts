import type { Goal, Plan } from '../types';

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3001';

export interface InvoiceResult {
  invoiceToken: string;
  checkoutUrl: string;
}

export async function createInvoice(plan: Plan, goal: Goal, userId?: string): Promise<InvoiceResult> {
  const returnUrl = `${window.location.origin}${window.location.pathname}#/paiement/retour`;
  const res = await fetch(`${API_URL}/api/payments/create-invoice`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan, goal, userId, returnUrl }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message ?? 'PAYMENT_ERROR');
  return data as InvoiceResult;
}

export async function verifyInvoice(token: string) {
  const res = await fetch(`${API_URL}/api/payments/verify/${token}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message ?? 'VERIFY_ERROR');
  return data as { status: string; plan?: Plan; goal?: Goal; activated?: boolean };
}
