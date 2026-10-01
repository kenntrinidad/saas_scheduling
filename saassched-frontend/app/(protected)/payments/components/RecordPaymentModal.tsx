// app/(protected)/payments/components/RecordPaymentModal.tsx
"use client";

import { useEffect, useState } from "react";
import { paymentsApi } from "../api";
import type { PaymentMethod, Client } from "../types";

interface RecordPaymentModalProps {
  open: boolean;
  onClose: () => void;
  onRecorded: () => void;
  clients: Client[];
}

const METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "gcash", label: "GCash" },
  { value: "card", label: "Card" },
];

export function RecordPaymentModal({ open, onClose, onRecorded, clients }: RecordPaymentModalProps) {
  const [clientId, setClientId] = useState<number | "">("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setClientId("");
    setAmount("");
    setMethod("cash");
    setNotes("");
    setError(null);
  }, [open]);

  if (!open) return null;

  const canSubmit = clientId !== "" && Number(amount) > 0 && !submitting;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await paymentsApi.record({
        client_id: Number(clientId),
        amount: Number(amount),
        method,
        notes: notes.trim() || undefined,
      });
      onRecorded();
      onClose();
    } catch (e) {
      setError("Couldn't record this payment. Check the details and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-end justify-center p-0 z-50 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="record-payment-title"
      onClick={onClose}
    >
      <div className="bg-white rounded-t-xl shadow-xl w-full max-w-sm max-h-[94dvh] overflow-y-auto sm:rounded-xl" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <h2 id="record-payment-title" className="text-base font-semibold text-neutral-800">
            Record payment
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex size-11 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#1D5F55]"
          >
            ×
          </button>
        </div>

        <div className="px-4 py-4 space-y-4 sm:px-6">
          <Field label="Client">
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value ? Number(e.target.value) : "")}
              className="w-full rounded-lg border border-neutral-300 bg-white text-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D5F55]"
            >
              <option value="">Select a client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Amount (₱)">
              <input
                type="number"
                min={0}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="200"
                className="w-full rounded-lg border border-neutral-300 bg-white text-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D5F55]"
              />
            </Field>
            <Field label="Method">
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                className="w-full rounded-lg border border-neutral-300 bg-white text-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D5F55]"
              >
                {METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Notes (optional)">
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 bg-white text-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D5F55]"
            />
          </Field>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="px-4 py-4 border-t border-neutral-200 flex flex-wrap justify-end gap-2 sm:px-6">
          <button
            onClick={onClose}
            className="min-h-11 px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="min-h-11 px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#1D5F55] hover:bg-[#164A42] disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D5F55]"
          >
            {submitting ? "Recording…" : "Record payment"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-neutral-500 mb-1">{label}</span>
      {children}
    </label>
  );
}
