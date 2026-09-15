// app/(protected)/appointments/api.ts
//
// Thin fetch wrapper around your FastAPI endpoints (see README "API Surface").
// If you already have a shared API client from your login/API-connection work,
// swap `apiFetch` below for that instead of duplicating auth handling here.

import type {
  Staff,
  Service,
  Client,
  AvailabilitySlot,
  AvailabilityQuery,
  CreateAppointmentPayload,
  AppointmentDTO,
} from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token"); // adjust key if your auth flow stores it elsewhere
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
    // Token missing/expired/rejected — same signal AuthGuard checks for on mount.
    // Clear it and bounce to /login so an expired session doesn't just show
    // confusing "couldn't load" errors on the page.
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

  // Some PATCH/DELETE endpoints may return 204 with no body
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const appointmentsApi = {
  listStaff: () => apiFetch<Staff[]>("/staff"),

  listServices: () => apiFetch<Service[]>("/services"),

  listClients: () => apiFetch<Client[]>("/clients"),

  getAvailability: (query: AvailabilityQuery) => {
    const params = new URLSearchParams({
      staff_id: String(query.staff_id),
      service_id: String(query.service_id),
      target_date: query.target_date,
    });
    return apiFetch<AvailabilitySlot[]>(`/availability?${params.toString()}`);
  },

  createAppointment: (payload: CreateAppointmentPayload) =>
    apiFetch<AppointmentDTO>("/appointments", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateStatus: (appointmentId: number, status: string) =>
    apiFetch<AppointmentDTO>(`/appointments/${appointmentId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  // Confirmed live: GET /api/v1/appointments, with optional `from`/`to`
  // (ISO datetimes) and `staff_id` query params.
  listAppointments: (from?: string, to?: string) => {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const qs = params.toString();
    return apiFetch<AppointmentDTO[]>(`/appointments${qs ? `?${qs}` : ""}`);
  },
};