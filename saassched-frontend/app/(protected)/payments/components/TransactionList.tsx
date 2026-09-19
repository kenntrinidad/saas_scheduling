// app/(protected)/payments/components/TransactionList.tsx
"use client";

import type { Payment, PaymentMethod } from "../types";

const METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Cash",
  gcash: "GCash",
  card: "Card",
  bank_transfer: "Bank Transfer",
  other: "Other",
};

const METHOD_COLOR: Record<PaymentMethod, string> = {
  cash: "#1D5F55",
  gcash: "#7C5CBF",
  card: "#2563A8",
};

interface TransactionListProps {
  payments: Payment[];
}

export function TransactionList({ payments }: TransactionListProps) {
  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center px-6">
        <p className="text-sm font-medium text-neutral-700">No payments recorded yet</p>
        <p className="text-sm text-neutral-500 mt-1">New transactions will show up here.</p>
      </div>
    );
  }

  const sorted = [...payments].sort((a, b) => new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime());

  return (
    <ul className="divide-y divide-neutral-100">
      {sorted.map((p) => (
        <li key={p.id} className="flex items-center justify-between gap-4 px-6 py-3">
          <div className="min-w-0 flex items-center gap-3">
            <span
              aria-hidden="true"
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: METHOD_COLOR[p.method] }}
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-neutral-800 truncate">{p.client_name}</p>
              {p.notes ? (
                <p className="text-xs text-neutral-500 truncate">{p.notes}</p>
              ) : p.status === "refunded" ? (
                <p className="text-xs text-red-600">Refunded</p>
              ) : null}
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-semibold text-neutral-800">₱{p.amount.toLocaleString()}</p>
            <p className="text-xs text-neutral-400">
              {METHOD_LABEL[p.method]} ·{" "}
              {new Date(p.paid_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
