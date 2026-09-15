// app/(protected)/staff/components/StaffScheduleModal.tsx
"use client";

import { useEffect, useState } from "react";
import { staffApi } from "../api";
import { WEEKDAYS } from "../types";
import type { StaffMember } from "../types";

interface StaffScheduleModalProps {
  open: boolean;
  onClose: () => void;
  member: StaffMember | null;
}

type DayResult = "pending" | "saving" | "done" | "error";

export function StaffScheduleModal({ open, onClose, member }: StaffScheduleModalProps) {
  const [selectedDays, setSelectedDays] = useState<Set<number>>(new Set());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<Record<number, DayResult>>({});

  useEffect(() => {
    if (!open) return;
    setSelectedDays(new Set());
    setStartTime("09:00");
    setEndTime("18:00");
    setResults({});
  }, [open, member]);

  if (!open || !member) return null;

  function toggleDay(value: number) {
    setSelectedDays((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  const canSubmit = selectedDays.size > 0 && startTime < endTime && !submitting;

  async function handleSubmit() {
    if (!canSubmit || !member) return;
    setSubmitting(true);
    const days = Array.from(selectedDays);
    const initial: Record<number, DayResult> = {};
    days.forEach((d) => (initial[d] = "pending"));
    setResults(initial);

    // Sequential, not parallel — easier to show per-day progress and avoids
    // hammering the endpoint if something's wrong with the first request.
    for (const day of days) {
      setResults((prev) => ({ ...prev, [day]: "saving" }));
      try {
        await staffApi.createSchedule({
          staff_id: member.id,
          day_of_week: day,
          start_time: `${startTime}:00`,
          end_time: `${endTime}:00`,
        });
        setResults((prev) => ({ ...prev, [day]: "done" }));
      } catch {
        setResults((prev) => ({ ...prev, [day]: "error" }));
      }
    }
    setSubmitting(false);
  }

  const hasResults = Object.keys(results).length > 0;
  const allDone = hasResults && Object.values(results).every((r) => r === "done");

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="staff-schedule-title"
      onClick={submitting ? undefined : onClose}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <h2 id="staff-schedule-title" className="text-base font-semibold text-neutral-800">
            Set schedule — {member.full_name}
          </h2>
          <button
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
            className="text-neutral-400 hover:text-neutral-600 text-xl leading-none disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#1D5F55]"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
            There's no way to view or edit existing schedule rows yet — this
            only <span className="font-semibold">adds new ones</span>. If a
            day below is already scheduled, submitting it again will create a
            duplicate row rather than update it. Check your database if unsure.
          </div>

          <div>
            <span className="block text-xs font-medium text-neutral-500 mb-2">Working days</span>
            <div className="grid grid-cols-2 gap-2">
              {WEEKDAYS.map((day) => {
                const checked = selectedDays.has(day.value);
                const result = results[day.value];
                return (
                  <label
                    key={day.value}
                    className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer transition-colors ${
                      checked ? "border-[#1D5F55] bg-[#E9F2EF]" : "border-neutral-300"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={submitting}
                        onChange={() => toggleDay(day.value)}
                        className="rounded border-neutral-300 text-[#1D5F55] focus:ring-[#1D5F55]"
                      />
                      {day.label}
                    </span>
                    {result === "saving" && <span className="text-xs text-neutral-400">…</span>}
                    {result === "done" && <span className="text-xs text-[#1D5F55]">✓</span>}
                    {result === "error" && <span className="text-xs text-red-600">✕</span>}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Start time">
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                disabled={submitting}
                className="w-full rounded-lg border border-neutral-300 bg-white text-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D5F55] disabled:opacity-60"
              />
            </Field>
            <Field label="End time">
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                disabled={submitting}
                className="w-full rounded-lg border border-neutral-300 bg-white text-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D5F55] disabled:opacity-60"
              />
            </Field>
          </div>
          {startTime >= endTime && (
            <p className="text-xs text-red-600">End time must be after start time.</p>
          )}

          {hasResults && (
            <p className="text-xs text-neutral-500">
              {allDone
                ? "All selected days saved."
                : submitting
                ? "Saving…"
                : "Some days failed — see the marks above. You can retry by reselecting just those days."}
            </p>
          )}
        </div>

        <div className="px-6 py-4 border-t border-neutral-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-800 disabled:opacity-40"
          >
            {allDone ? "Done" : "Cancel"}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#1D5F55] hover:bg-[#164A42] disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D5F55]"
          >
            {submitting ? "Saving…" : `Save schedule (${selectedDays.size || 0})`}
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
