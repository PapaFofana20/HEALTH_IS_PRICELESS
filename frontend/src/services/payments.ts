import type { Goal, Plan } from '../types';

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3001';

export interface InvoiceResult {
  invoiceToken: string;
  checkoutUrl: string;
}

export async function createInvoice(plan: Plan, goal: Goal): Promise<InvoiceResult> {
  const returnUrl = `${window.location.origin}${window.location.pathname}#/paiement/retour`;
  const res = await fetch(`${API_URL}/api/payments/create-invoice`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan, goal, returnUrl }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message ?? 'PAYMENT_ERROR');
  return data as InvoiceResult;
}

export async function verifyInvoice(token: string, plan?: Plan | null, goal?: Goal | null) {
  const query = plan && goal ? `?plan=${plan}&goal=${goal}` : '';
  const res = await fetch(`${API_URL}/api/payments/verify/${token}${query}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message ?? 'VERIFY_ERROR');
  return data as { status: string; plan?: Plan; goal?: Goal };
}
