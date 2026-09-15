// app/(protected)/staff/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { StaffGrid } from "./components/StaffGrid";
import { StaffFormModal } from "./components/StaffFormModal";
import { StaffScheduleModal } from "./components/StaffScheduleModal";
import { staffApi } from "./api";
import type { StaffMember } from "./types";

type StatusFilter = "all" | "active" | "inactive";

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [schedulingMember, setSchedulingMember] = useState<StaffMember | null>(null);

  function refresh() {
    setLoading(true);
    setLoadError(null);
    staffApi
      .list()
      .then(setStaff)
      .catch(() => setLoadError("Couldn't load staff. Check your connection and try again."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    return staff.filter((s) => {
      if (status === "active" && !s.is_active) return false;
      if (status === "inactive" && s.is_active) return false;
      const q = search.trim().toLowerCase();
      if (q && !s.full_name.toLowerCase().includes(q) && !(s.email ?? "").toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [staff, search, status]);

  function openAdd() {
    setEditingMember(null);
    setModalOpen(true);
  }

  function openEdit(member: StaffMember) {
    setEditingMember(member);
    setModalOpen(true);
  }

  function openSchedule(member: StaffMember) {
    setSchedulingMember(member);
    setScheduleModalOpen(true);
  }

  return (
    <div className="bg-[#FAFAF8]">
      <div className="max-w-4xl mx-auto">
        <header className="px-6 pt-6 pb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-[Manrope] text-2xl font-bold text-neutral-900">Staff</h1>
          <button
            onClick={openAdd}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#1D5F55] hover:bg-[#164A42] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D5F55]"
          >
            + Add staff
          </button>
        </header>

        <div className="bg-white rounded-t-xl border border-neutral-200 mx-4">
          <div className="flex flex-wrap items-center gap-3 px-6 py-3 border-b border-neutral-200">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search staff…"
              aria-label="Search staff"
              className="flex-1 min-w-[160px] rounded-lg border border-neutral-300 bg-white text-neutral-900 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D5F55]"
            />
            <div className="flex rounded-lg border border-neutral-200 p-0.5">
              {(["all", "active", "inactive"] as StatusFilter[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                    status === s ? "bg-[#1D5F55] text-white" : "text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64 text-sm text-neutral-500">
              Loading staff…
            </div>
          ) : loadError ? (
            <div className="flex flex-col items-center justify-center h-64 text-center px-6">
              <p className="text-sm font-medium text-red-600">{loadError}</p>
              <button
                onClick={refresh}
                className="mt-3 px-4 py-1.5 rounded-lg text-sm font-medium border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
              >
                Retry
              </button>
            </div>
          ) : (
            <StaffGrid staff={filtered} onSelect={openEdit} onSchedule={openSchedule} />
          )}
        </div>
        <div className="h-8" />
      </div>

      <StaffFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={refresh}
        member={editingMember}
      />

      <StaffScheduleModal
        open={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        member={schedulingMember}
      />
    </div>
  );
}