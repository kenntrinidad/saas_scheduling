// app/(protected)/payments/api.ts
//
// Confirmed live against app/api/v1/payments.py:
//   GET  /api/v1/payments?from=&to=&method=   -> PaymentDTO[]
//   POST /api/v1/payments                     -> PaymentDTO

import type { PaymentDTO, RecordPaymentInput, Client } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    throw new Error(`API 401 ${path}: session expired`);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`API ${res.status} ${path}: ${body}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const paymentsApi = {
  list: (from?: string, to?: string, method?: string) => {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (method) params.set("method", method);
    const qs = params.toString();
    return apiFetch<PaymentDTO[]>(`/payments${qs ? `?${qs}` : ""}`);
  },

  record: (payload: RecordPaymentInput) =>
    apiFetch<PaymentDTO>("/payments", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  listClients: () => apiFetch<Client[]>("/clients"),
};