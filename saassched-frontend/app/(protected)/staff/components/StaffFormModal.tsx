// app/(protected)/staff/components/StaffFormModal.tsx
"use client";

import { useEffect, useState } from "react";
import { staffApi } from "../api";
import type { StaffMember } from "../types";

interface StaffFormModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  /** Pass an existing member to edit; omit to create a new one. */
  member?: StaffMember | null;
}

export function StaffFormModal({ open, onClose, onSaved, member }: StaffFormModalProps) {
  const isEdit = Boolean(member);

  const [userId, setUserId] = useState("");
  const [fullName, setFullName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [socialLink, setSocialLink] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setUserId(member?.user_id ? String(member.user_id) : "");
    setFullName(member?.full_name ?? "");
    setContact(member?.contact ?? "");
    setEmail(member?.email ?? "");
    setSocialLink(member?.social_media_link ?? "");
    setIsActive(member?.is_active ?? true);
    setError(null);
  }, [open, member]);

  if (!open) return null;

  const canSubmit =
    fullName.trim().length > 0 && (isEdit || Number(userId) > 0) && !submitting;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const shared = {
        full_name: fullName.trim(),
        contact: contact.trim() || undefined,
        email: email.trim() || undefined,
        social_media_link: socialLink.trim() || undefined,
        is_active: isActive,
      };
      if (isEdit && member) {
        await staffApi.update(member.id, shared);
      } else {
        await staffApi.create({ ...shared, user_id: Number(userId) });
      }
      onSaved();
      onClose();
    } catch (e) {
      if (e instanceof Error && e.message === "FORBIDDEN") {
        setError("Only account owners can manage staff.");
      } else {
        setError(
          isEdit
            ? "Couldn't save these changes. Try again."
            : "Couldn't add this staff profile — double check the user ID exists."
        );
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
      aria-labelledby="staff-form-title"
      onClick={onClose}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <h2 id="staff-form-title" className="text-base font-semibold text-neutral-800">
            {isEdit ? "Edit staff profile" : "Add staff profile"}
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
          {!isEdit && (
            <>
              <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
                This staff member needs a login already created via the invite
                script before you can add their profile here — enter the
                <span className="font-semibold"> user ID</span> that script
                gave you.
              </div>
              <Field label="User ID">
                <input
                  type="number"
                  min={1}
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="e.g. 4"
                  className="w-full rounded-lg border border-neutral-300 bg-white text-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D5F55]"
                />
              </Field>
            </>
          )}

          <Field label="Full name">
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Maria Santos"
              className="w-full rounded-lg border border-neutral-300 bg-white text-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D5F55]"
            />
          </Field>

          <Field label="Contact (optional)">
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="09171234567"
              className="w-full rounded-lg border border-neutral-300 bg-white text-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D5F55]"
            />
          </Field>

          <Field label="Email (optional)">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full rounded-lg border border-neutral-300 bg-white text-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D5F55]"
            />
          </Field>

          <Field label="Social media link (optional)">
            <input
              type="url"
              value={socialLink}
              onChange={(e) => setSocialLink(e.target.value)}
              placeholder="https://instagram.com/..."
              className="w-full rounded-lg border border-neutral-300 bg-white text-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D5F55]"
            />
          </Field>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-neutral-300 text-[#1D5F55] focus:ring-[#1D5F55]"
            />
            <span className="text-sm text-neutral-700">Active — bookable right away</span>
          </label>

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
            {submitting ? "Saving…" : isEdit ? "Save changes" : "Add profile"}
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
