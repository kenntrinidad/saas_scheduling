// app/(protected)/clients/components/ClientFormModal.tsx
"use client";

import { useState } from "react";
import { clientsApi } from "../api";
import type { Client } from "../types";

interface ClientFormModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  /** Pass an existing client to edit it; omit to create a new one. */
  client?: Client | null;
}

export function ClientFormModal({ open, onClose, onSaved, client }: ClientFormModalProps) {
  const isEdit = Boolean(client);

  const [fullName, setFullName] = useState(() => client?.full_name ?? "");
  const [email, setEmail] = useState(() => client?.email ?? "");
  const [phone, setPhone] = useState(() => client?.phone ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const canSubmit = fullName.trim().length > 0 && phone.trim().length > 0 && !submitting;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        full_name: fullName.trim(),
        email: email.trim() || undefined,
        contacts: phone.trim(),
      };
      if (isEdit && client) {
        await clientsApi.update(client.id, payload);
      } else {
        await clientsApi.create(payload);
      }
      onSaved();
      onClose();
    } catch (e) {
      if (e instanceof Error && e.message === "FORBIDDEN") {
        setError("You don't have permission to do that.");
      } else {
        setError("Couldn't save this client. Check the details and try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-end justify-center p-0 z-50 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="client-form-title"
      onClick={onClose}
    >
      <div className="bg-white rounded-t-xl shadow-xl w-full max-w-sm max-h-[94dvh] overflow-y-auto sm:rounded-xl" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <h2 id="client-form-title" className="text-base font-semibold text-neutral-800">
            {isEdit ? "Edit client" : "Add client"}
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
          <Field label="Full name">
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Trinidad Reyes"
              className="w-full rounded-lg border border-neutral-300 bg-white text-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D5F55]"
            />
          </Field>

          <Field label="Email Address (optional)">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full rounded-lg border border-neutral-300 bg-white text-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D5F55]"
            />
          </Field>

          <Field label="Contact Number">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="09171234567"
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
            {submitting ? "Saving…" : isEdit ? "Save changes" : "Add client"}
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
