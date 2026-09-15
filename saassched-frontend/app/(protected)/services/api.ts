// app/(protected)/services/api.ts
//
// Matches your README API Surface: POST /services (owner), GET /services,
// GET /services/{id}. No PATCH/DELETE yet — see Known Gaps in the README —
// so this client intentionally has no updateService/deleteService.

import type { Service, CreateServicePayload } from "./types";

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

export const servicesApi = {
  list: () => apiFetch<Service[]>("/services"),

  get: (id: number) => apiFetch<Service>(`/services/${id}`),

  create: (payload: CreateServicePayload) =>
    apiFetch<Service>("/services", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // No update/delete yet — add here once the backend supports them:
  // update: (id: number, payload: Partial<CreateServicePayload>) =>
  //   apiFetch<Service>(`/services/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  // remove: (id: number) => apiFetch<void>(`/services/${id}`, { method: "DELETE" }),
};