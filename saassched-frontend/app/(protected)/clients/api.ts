// app/(protected)/clients/api.ts
//
// Matches your README API Surface: POST /clients, GET /clients,
// GET /clients/{id}, PATCH /clients/{id}. No DELETE yet.

import type { Client, ClientDTO, CreateClientPayload, UpdateClientPayload } from "./types";
import { transformClient } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://saas-scheduling.onrender.com/api/v1";

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
  list: async () => {
    const dtos = await apiFetch<ClientDTO[]>("/clients");
    return dtos.map(transformClient);
  },

  get: async (id: number) => {
    const dto = await apiFetch<ClientDTO>(`/clients/${id}`);
    return transformClient(dto);
  },

  create: async (payload: CreateClientPayload) => {
    const dto = await apiFetch<ClientDTO>("/clients", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return transformClient(dto);
  },

  update: async (id: number, payload: UpdateClientPayload) => {
    const dto = await apiFetch<ClientDTO>(`/clients/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return transformClient(dto);
  },

  // No delete endpoint yet.
};