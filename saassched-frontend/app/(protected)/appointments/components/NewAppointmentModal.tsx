// app/appointments/components/NewAppointmentModal.tsx
"use client";

import { useEffect, useState } from "react";
import type { Staff, Service, Client, AvailabilitySlot } from "../types";
import { appointmentsApi } from "../api";

interface NewAppointmentModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  staff: Staff[];
  services: Service[];
  clients: Client[];
}

function formatTimeLabel(hhmmss: string): string {
  // "09:00:00" -> "9:00 AM" — done manually since a bare "HH:MM:SS" string
  // isn't reliably parsed by `new Date(...)` across browsers.
  const [hStr, mStr] = hhmmss.split(":");
  const h = Number(hStr);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${mStr} ${period}`;
}

export function NewAppointmentModal({
  open,
  onClose,
  onCreated,
  staff,
  services,
  clients,
}: NewAppointmentModalProps) {
  const [clientId, setClientId] = useState<number | "">("");
  const [staffId, setStaffId] = useState<number | "">("");
  const [serviceId, setServiceId] = useState<number | "">("");
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");

  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    // reset on open
    setClientId("");
    setStaffId("");
    setServiceId("");
    setNotes("");
    setSlots([]);
    setSelectedSlot(null);
    setError(null);
  }, [open]);

  useEffect(() => {
    if (!staffId || !serviceId || !date) {
      setSlots([]);
      return;
    }
    let cancelled = false;
    setLoadingSlots(true);
    setError(null);
    appointmentsApi
      .getAvailability({ staff_id: Number(staffId), service_id: Number(serviceId), target_date: date })
      .then((res) => {
        if (cancelled) return;
        // Defensive dedupe: overlapping/duplicate StaffSchedule rows on the
        // backend (no DELETE endpoint exists yet to clean those up) can
        // produce the same start time twice. Collapse by `start` so the
        // picker never shows duplicate buttons even if the data is messy.
        const seen = new Set<string>();
        const deduped = res.filter((slot) => {
          if (seen.has(slot.start)) return false;
          seen.add(slot.start);
          return true;
        });
        setSlots(deduped);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load availability. Try a different date or staff member.");
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });
    return () => {
      cancelled = true;
    };
  }, [staffId, serviceId, date]);

  if (!open) return null;

  const canSubmit = clientId && staffId && serviceId && selectedSlot && !submitting;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await appointmentsApi.createAppointment({
        client_id: Number(clientId),
        staff_id: Number(staffId),
        service_ids: [Number(serviceId)],
        // The API gives back bare times ("09:00:00"), not dated timestamps —
        // combine with the picked date ourselves before submitting. Field
        // name confirmed from app/schemas/appointment.py: `appointment_date`.
        appointment_date: `${date}T${selectedSlot}`,
      });
      onCreated();
      onClose();
    } catch (e) {
      setError("Couldn't book that slot — it may have just been taken. Pick another time.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-appt-title"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <h2 id="new-appt-title" className="text-base font-semibold text-neutral-800">
            New appointment
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

          <Field label="Service">
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value ? Number(e.target.value) : "")}
              className="w-full rounded-lg border border-neutral-300 bg-white text-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D5F55]"
            >
              <option value="">Select a service</option>
              {services
                .filter((s) => s.is_active)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} · {s.duration_minutes} min · ₱{s.price}
                  </option>
                ))}
            </select>
          </Field>

          <Field label="Staff">
            <select
              value={staffId}
              onChange={(e) => setStaffId(e.target.value ? Number(e.target.value) : "")}
              className="w-full rounded-lg border border-neutral-300 bg-white text-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D5F55]"
            >
              <option value="">Select staff</option>
              {staff.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Date">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 bg-white text-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D5F55]"
            />
          </Field>

          <Field label="Available times">
            {loadingSlots ? (
              <p className="text-sm text-neutral-500">Loading times…</p>
            ) : !staffId || !serviceId ? (
              <p className="text-sm text-neutral-400">Pick a service and staff member first.</p>
            ) : slots.length === 0 ? (
              <p className="text-sm text-neutral-500">No open slots on this date.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {slots.map((slot) => {
                  const active = selectedSlot === slot.start;
                  return (
                    <button
                      key={slot.start}
                      onClick={() => setSelectedSlot(slot.start)}
                      className={`rounded-lg border px-2 py-1.5 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#1D5F55] ${
                        active
                          ? "bg-[#1D5F55] border-[#1D5F55] text-white"
                          : "border-neutral-300 text-neutral-700 hover:border-[#1D5F55]"
                      }`}
                    >
                      {formatTimeLabel(slot.start)}
                    </button>
                  );
                })}
              </div>
            )}
          </Field>

          <Field label="Notes (optional)">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-neutral-300 bg-white text-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D5F55]"
              placeholder="Anything staff should know before the appointment"
            />
            <span className="block text-xs text-amber-700 mt-1">
              Not saved yet — the backend's appointment model doesn't store notes.
            </span>
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
            {submitting ? "Booking…" : "Book appointment"}
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