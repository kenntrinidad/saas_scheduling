// app/(protected)/payments/components/SummaryCards.tsx
"use client";

import type { Payment, PaymentMethod } from "../types";

const METHOD_LABEL: Record<PaymentMethod, string> = {
  cash: "Cash",
  card: "Card",
  gcash: "GCash",
  bank_transfer: "Bank transfer",
  other: "Other",
};

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

function isThisWeek(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  start.setHours(0, 0, 0, 0);
  return d >= start;
}

function formatPeso(n: number): string {
  return `₱${n.toLocaleString()}`;
}

interface SummaryCardsProps {
  payments: Payment[];
}

export function SummaryCards({ payments }: SummaryCardsProps) {
  const today = payments.filter((p) => isToday(p.paid_at));
  const week = payments.filter((p) => isThisWeek(p.paid_at));

  const todayTotal = today.reduce((sum, p) => sum + p.amount, 0);
  const weekTotal = week.reduce((sum, p) => sum + p.amount, 0);

  const byMethod = week.reduce<Record<string, number>>((acc, p) => {
    acc[p.method] = (acc[p.method] ?? 0) + p.amount;
    return acc;
  }, {});
  const topMethod = Object.entries(byMethod).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-6 pt-5">
      <StatCard label="Today" value={formatPeso(todayTotal)} sub={`${today.length} payment${today.length === 1 ? "" : "s"}`} />
      <StatCard label="This week" value={formatPeso(weekTotal)} sub={`${week.length} payment${week.length === 1 ? "" : "s"}`} />
      <StatCard
        label="Top method (week)"
        value={topMethod ? METHOD_LABEL[topMethod[0] as PaymentMethod] : "—"}
        sub={topMethod ? formatPeso(topMethod[1]) : "No payments yet"}
      />
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 px-4 py-3">
      <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide">{label}</p>
      <p className="text-xl font-semibold text-neutral-800 mt-1">{value}</p>
      <p className="text-xs text-neutral-500 mt-0.5">{sub}</p>
    </div>
  );
}
