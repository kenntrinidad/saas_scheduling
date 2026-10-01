"use client";

import { useEffect, useState, useCallback } from "react";
import { dashboardApi } from "./dashboard.api";
import type { DashboardSummary, DashboardEarnings, SystemStatus } from "./dashboard.types";

function formatPeso(amount: string): string {
  const n = Number(amount);
  return `₱${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function StatusBadge({ status }: { status: SystemStatus }) {
  const config = {
    checking: { label: "Checking…", color: "bg-neutral-300", text: "text-neutral-600" },
    online: { label: "Online", color: "bg-emerald-500", text: "text-emerald-700" },
    offline: { label: "Offline", color: "bg-red-500", text: "text-red-700" },
  }[status];

  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${config.text}`}>
      <span className={`w-2 h-2 rounded-full ${config.color}`} aria-hidden="true" />
      {config.label}
    </span>
  );
}

function MetricCard({ title, value, sub }: { title: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5">
      <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">{title}</p>
      <p className="mt-2 text-2xl font-bold text-neutral-900">{value}</p>
      {sub && <p className="mt-1 text-xs text-neutral-400">{sub}</p>}
    </div>
  );
}

function PeriodBreakdown({ title, today, week, month }: { title: string; today: string | number; week: string | number; month: string | number }) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5">
      <p className="text-sm font-semibold text-neutral-800 mb-3">{title}</p>
      <div className="grid grid-cols-3 divide-x divide-neutral-100 text-center">
        <div>
          <p className="text-xs text-neutral-400">Today</p>
          <p className="mt-1 text-lg font-bold text-neutral-900">{today}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-400">This Week</p>
          <p className="mt-1 text-lg font-bold text-neutral-900">{week}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-400">This Month</p>
          <p className="mt-1 text-lg font-bold text-neutral-900">{month}</p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [status, setStatus] = useState<SystemStatus>("checking");
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  const [earningsRange, setEarningsRange] = useState<"today" | "week" | "month" | "custom">("today");
  const [customStart, setCustomStart] = useState(todayISO());
  const [customEnd, setCustomEnd] = useState(todayISO());
  const [customEarnings, setCustomEarnings] = useState<DashboardEarnings | null>(null);
  const [customEarningsError, setCustomEarningsError] = useState<string | null>(null);
  const [customEarningsLoading, setCustomEarningsLoading] = useState(false);

  const checkStatus = useCallback(() => {
    dashboardApi.checkHealth().then((ok) => setStatus(ok ? "online" : "offline"));
  }, []);

  const loadSummary = useCallback(() => {
    setSummaryLoading(true);
    setSummaryError(null);
    dashboardApi
      .getSummary()
      .then(setSummary)
      .catch(() => setSummaryError("Unable to load dashboard data."))
      .finally(() => setSummaryLoading(false));
  }, []);

  useEffect(() => {
    checkStatus();
    loadSummary();
    const interval = setInterval(checkStatus, 30000); // FR-017-06: update without manual refresh
    return () => clearInterval(interval);
  }, [checkStatus, loadSummary]);

  function runCustomEarningsSearch() {
    if (customStart > customEnd) {
      setCustomEarningsError("Start date must not be after end date.");
      setCustomEarnings(null);
      return;
    }
    setCustomEarningsLoading(true);
    setCustomEarningsError(null);
    dashboardApi
      .getEarnings(customStart, customEnd)
      .then(setCustomEarnings)
      .catch(() => setCustomEarningsError("Unable to load earnings for this range."))
      .finally(() => setCustomEarningsLoading(false));
  }

  return (
    <div className="bg-[#FAFAF8] min-h-screen">
      <div className="max-w-5xl mx-auto px-2 py-4 sm:px-6 sm:py-6">
        <header className="flex items-center justify-between gap-3 mb-6">
          <h1 className="hidden text-2xl font-bold text-neutral-900 md:block">Dashboard</h1>
          <StatusBadge status={status} />
        </header>

        {summaryLoading ? (
          <div className="flex items-center justify-center h-48 text-sm text-neutral-500">Loading…</div>
        ) : summaryError ? (
          <div className="flex flex-col items-center justify-center h-48 text-center gap-3">
            <p className="text-sm text-red-600">{summaryError}</p>
            <button
              onClick={loadSummary}
              className="px-4 py-1.5 rounded-lg text-sm font-medium border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
            >
              Retry
            </button>
          </div>
        ) : summary ? (
          <div className="space-y-6">
            {/* Top-line tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <MetricCard
                title="Staff Available"
                value={`${summary.staff.available_today} / ${summary.staff.total_staff}`}
                sub="Today"
              />
              <MetricCard title="Confirmed Appointments" value={summary.appointments.confirmed_today} sub="Today" />
              <MetricCard title="Earnings" value={formatPeso(summary.earnings.today)} sub="Today" />
            </div>

            {/* Staff Availability breakdown */}
            <PeriodBreakdown
              title="Staff Availability"
              today={summary.staff.available_today}
              week={summary.staff.week.unique_available}
              month={summary.staff.month.unique_available}
            />

            {/* Confirmed Appointments breakdown */}
            <PeriodBreakdown
              title="Confirmed Appointments"
              today={summary.appointments.confirmed_today}
              week={summary.appointments.confirmed_week}
              month={summary.appointments.confirmed_month}
            />

            {/* Earnings widget with quick filters + custom range */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5">
              <p className="text-sm font-semibold text-neutral-800 mb-3">Earnings</p>

              <div className="flex flex-wrap items-center gap-2 mb-4">
                {(["today", "week", "month", "custom"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setEarningsRange(r)}
                    className={`min-h-11 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      earningsRange === r
                        ? "bg-[#1D5F55] text-white"
                        : "border border-neutral-300 text-neutral-600 hover:bg-neutral-50"
                    }`}
                  >
                    {r === "today" ? "Today" : r === "week" ? "This Week" : r === "month" ? "This Month" : "Custom Range"}
                  </button>
                ))}
              </div>

              {earningsRange === "custom" && (
                <div className="mb-4 flex flex-col items-stretch gap-3 min-[400px]:flex-row min-[400px]:flex-wrap min-[400px]:items-end">
                  <label className="w-full text-sm min-[400px]:w-auto">
                    <span className="block text-neutral-500 mb-1">Start date</span>
                    <input
                      type="date"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="min-h-11 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm min-[400px]:w-auto"
                    />
                  </label>
                  <label className="w-full text-sm min-[400px]:w-auto">
                    <span className="block text-neutral-500 mb-1">End date</span>
                    <input
                      type="date"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className="min-h-11 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm min-[400px]:w-auto"
                    />
                  </label>
                  <button
                    onClick={runCustomEarningsSearch}
                    className="min-h-11 px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#1D5F55] hover:bg-[#164A42]"
                  >
                    Search
                  </button>
                </div>
              )}

              <div className="text-center py-4">
                {earningsRange === "today" && <p className="text-3xl font-bold text-neutral-900">{formatPeso(summary.earnings.today)}</p>}
                {earningsRange === "week" && <p className="text-3xl font-bold text-neutral-900">{formatPeso(summary.earnings.week)}</p>}
                {earningsRange === "month" && <p className="text-3xl font-bold text-neutral-900">{formatPeso(summary.earnings.month)}</p>}
                {earningsRange === "custom" && (
                  customEarningsLoading ? (
                    <p className="text-sm text-neutral-500">Loading…</p>
                  ) : customEarningsError ? (
                    <p className="text-sm text-red-600">{customEarningsError}</p>
                  ) : customEarnings ? (
                    <p className="text-3xl font-bold text-neutral-900">{formatPeso(customEarnings.total_earnings)}</p>
                  ) : (
                    <p className="text-sm text-neutral-400">Select a range and search</p>
                  )
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}