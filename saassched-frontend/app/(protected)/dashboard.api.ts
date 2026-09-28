import type { DashboardSummary, DashboardEarnings } from "./dashboard.types";

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

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`API ${res.status} ${path}: ${body}`);
  }

  return res.json() as Promise<T>;
}

export const dashboardApi = {
  checkHealth: async (): Promise<boolean> => {
    try {
      const res = await fetch(`${BASE_URL}/health`);
      if (!res.ok) return false;
      const data = await res.json();
      return data.status === "ok";
    } catch {
      return false;
    }
  },

  getSummary: () => apiFetch<DashboardSummary>("/dashboard/summary"),

  getEarnings: (startDate: string, endDate: string) =>
    apiFetch<DashboardEarnings>(`/dashboard/earnings?start_date=${startDate}&end_date=${endDate}`),
};
