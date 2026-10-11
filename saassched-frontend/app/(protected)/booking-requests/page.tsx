"use client";

import { useCallback, useEffect, useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

type RequestStatus = "pending" | "approved" | "rejected";

interface BookingRequest {
  id: number;
  full_name: string;
  phone?: string | null;
  email?: string | null;
  preferred_time: string;
  notes?: string | null;
  status: RequestStatus;
  created_at?: string | null;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("Session expired");
  }
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(body || `Request failed (${res.status})`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export default function BookingRequestsPage() {
  const [items, setItems] = useState<BookingRequest[]>([]);
  const [status, setStatus] = useState<RequestStatus | "">("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const qs = status ? `?status=${status}` : "";
    apiFetch<BookingRequest[]>(`/booking-requests${qs}`)
      .then(setItems)
      .catch((e) => setError(e.message || "Failed to load requests"))
      .finally(() => setLoading(false));
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleApprove(id: number) {
    setActingId(id);
    try {
      await apiFetch(`/booking-requests/${id}/approve`, { method: "POST" });
      load();
    } catch (e: any) {
      setError(e.message || "Approve failed");
    } finally {
      setActingId(null);
    }
  }

  async function handleReject(id: number) {
    setActingId(id);
    try {
      await apiFetch(`/booking-requests/${id}/reject`, { method: "POST" });
      load();
    } catch (e: any) {
      setError(e.message || "Reject failed");
    } finally {
      setActingId(null);
    }
  }

  return (
    <div className="bg-[#FAFAF8] min-h-full">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Booking Requests</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Review customer appointment requests from the public form.
            </p>
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as RequestStatus | "")}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="">All</option>
          </select>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <div className="mt-6 space-y-3">
          {loading ? (
            <p className="text-sm text-neutral-500">Loading…</p>
          ) : items.length === 0 ? (
            <div className="rounded-xl border border-neutral-200 bg-white px-6 py-12 text-center text-sm text-neutral-500">
              No requests in this filter.
            </div>
          ) : (
            items.map((r) => (
              <div
                key={r.id}
                className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-semibold text-neutral-900">{r.full_name}</h2>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="mt-1 text-sm text-neutral-600">
                      {formatDateTime(r.preferred_time)}
                    </p>
                    <div className="mt-2 space-y-0.5 text-sm text-neutral-500">
                      {r.phone && <p>Phone: {r.phone}</p>}
                      {r.email && <p>Email: {r.email}</p>}
                      {r.notes && <p className="text-neutral-700">Notes: {r.notes}</p>}
                    </div>
                  </div>

                  {r.status === "pending" && (
                    <div className="flex shrink-0 gap-2">
                      <button
                        onClick={() => handleApprove(r.id)}
                        disabled={actingId === r.id}
                        className="rounded-lg bg-[#1D5F55] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#164A42] disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(r.id)}
                        disabled={actingId === r.id}
                        className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: RequestStatus }) {
  const styles =
    status === "pending"
      ? "bg-amber-50 text-amber-800"
      : status === "approved"
        ? "bg-emerald-50 text-emerald-800"
        : "bg-neutral-100 text-neutral-600";
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${styles}`}>
      {status}
    </span>
  );
}

function formatDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-PH", {
      timeZone: "Asia/Manila",
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}