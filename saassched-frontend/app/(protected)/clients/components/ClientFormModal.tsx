// app/(protected)/clients/components/ClientFormModal.tsx
"use client";

import { useEffect, useState } from "react";
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

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setFullName(client?.full_name ?? "");
    setEmail(client?.email ?? "");
    setPhone(client?.phone ?? "");
    setError(null);
  }, [open, client]);

  if (!open) return null;

  const canSubmit = fullName.trim().length > 0 && email.trim().length > 0 && !submitting;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        full_name: fullName.trim(),
        email: email.trim() || undefined,
        contacts: phone.trim() || undefined,
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
      className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="client-form-title"
      onClick={onClose}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <h2 id="client-form-title" className="text-base font-semibold text-neutral-800">
            {isEdit ? "Edit client" : "Add client"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-neutral-400 hover:text-neutral-600 text-xl leading-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#1D5F55]"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <Field label="Full name">
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Trinidad Reyes"
              className="w-full rounded-lg border border-neutral-300 bg-white text-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D5F55]"
            />
          </Field>

          <Field label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full rounded-lg border border-neutral-300 bg-white text-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D5F55]"
            />
          </Field>

          <Field label="Phone (optional)">
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

        <div className="px-6 py-4 border-t border-neutral-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#1D5F55] hover:bg-[#164A42] disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D5F55]"
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
