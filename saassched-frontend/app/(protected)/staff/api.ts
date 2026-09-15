// app/(protected)/staff/api.ts
//
// Matches your README API Surface: POST /staff (owner), GET /staff,
// GET /staff/{id}, PATCH /staff/{id} (owner). No DELETE.
//
// Reminder from your README's Known Gaps: POST /staff requires a user_id
// that currently only exists after running a one-off script to create the
// staff login — there's no "create staff user" endpoint yet.

import type { StaffMember, CreateStaffPayload, UpdateStaffPayload, CreateStaffScheduleInput } from "./types";

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

export const staffApi = {
  list: () => apiFetch<StaffMember[]>("/staff"),

  get: (id: number) => apiFetch<StaffMember>(`/staff/${id}`),

  create: (payload: CreateStaffPayload) =>
    apiFetch<StaffMember>("/staff", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (id: number, payload: UpdateStaffPayload) =>
    apiFetch<StaffMember>(`/staff/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  // No delete endpoint yet.

  // Confirmed live: POST /staff-schedules (owner-only). No GET/PATCH/DELETE
  // exist — every call here creates a new row, with no way to check for or
  // clean up duplicates from the frontend.
  createSchedule: (payload: CreateStaffScheduleInput) =>
    apiFetch<unknown>("/staff-schedules", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};