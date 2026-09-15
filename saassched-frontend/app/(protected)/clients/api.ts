// app/(protected)/clients/api.ts
//
// Matches your README API Surface: POST /clients, GET /clients,
// GET /clients/{id}, PATCH /clients/{id}. No DELETE yet.

import type { Client, CreateClientPayload, UpdateClientPayload } from "./types";

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

  if (res.status === 403) {
    throw new Error("FORBIDDEN");
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`API ${res.status} ${path}: ${body}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const clientsApi = {
  list: () => apiFetch<Client[]>("/clients"),

  get: (id: number) => apiFetch<Client>(`/clients/${id}`),

  create: (payload: CreateClientPayload) =>
    apiFetch<Client>("/clients", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (id: number, payload: UpdateClientPayload) =>
    apiFetch<Client>(`/clients/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  // No delete endpoint yet.
};