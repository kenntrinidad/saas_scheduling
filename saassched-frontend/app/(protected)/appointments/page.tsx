// app/(protected)/appointments/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { DayGrid, WeekGrid } from "./components/CalendarGrid";
import { ListView } from "./components/ListView";
import { StaffFilter } from "./components/StaffFilter";
import { NewAppointmentModal } from "./components/NewAppointmentModal";
import { appointmentsApi } from "./api";
import { mockStaff, mockServices } from "./mock-data";
import { transformAppointment } from "./types";
import type { Appointment, AppointmentDTO, Staff, Service, Client } from "./types";

type ViewMode = "day" | "week" | "list";

function startOfWeek(d: Date): Date {
  const day = d.getDay();
  const diff = d.getDate() - day; // week starts Sunday
  const result = new Date(d);
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

function formatRangeLabel(view: ViewMode, refDate: Date): string {
  if (view === "day") {
    return refDate.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
  }
  const start = startOfWeek(refDate);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const sameMonth = start.getMonth() === end.getMonth();
  const startLabel = start.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const endLabel = end.toLocaleDateString(undefined, {
    month: sameMonth ? undefined : "short",
    day: "numeric",
  });
  return `${startLabel} – ${endLabel}`;
}

function getVisibleRange(view: ViewMode, refDate: Date): { from: Date; to: Date } {
  if (view === "week") {
    const from = startOfWeek(refDate);
    const to = new Date(from);
    to.setDate(to.getDate() + 7);
    return { from, to };
  }
  const from = new Date(refDate);
  from.setHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setDate(to.getDate() + 1);
  return { from, to };
}

export default function AppointmentsPage() {
  const [view, setView] = useState<ViewMode>("day");
  const [refDate, setRefDate] = useState(() => new Date());
  const [selectedStaff, setSelectedStaff] = useState<number | "all">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);

  const [staff, setStaff] = useState<Staff[]>(mockStaff);
  const [services, setServices] = useState<Service[]>(mockServices);
  const [clients, setClients] = useState<Client[]>([]);

  const [appointmentDTOs, setAppointmentDTOs] = useState<AppointmentDTO[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(null);

  // Load real reference data (staff/services/clients) once on mount.
  useEffect(() => {
    appointmentsApi.listStaff().then(setStaff).catch(() => {
      /* fall back to mock staff already set */
    });
    appointmentsApi.listServices().then(setServices).catch(() => {
      /* fall back to mock services already set */
    });
    appointmentsApi.listClients().then(setClients).catch(() => {
      /* leave empty; modal will show no clients until this succeeds */
    });
  }, []);

  function refreshAppointments() {
    const { from, to } = getVisibleRange(view, refDate);
    setLoadingAppointments(true);
    setAppointmentsError(null);
    appointmentsApi
      .listAppointments(from.toISOString(), to.toISOString())
      .then(setAppointmentDTOs)
      .catch(() => setAppointmentsError("Couldn't load appointments. Check your connection and try again."))
      .finally(() => setLoadingAppointments(false));
  }

  // Refetch whenever the visible date range changes (day/week nav, or
  // switching view — list view uses the same range as day view).
  useEffect(() => {
    refreshAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, refDate]);

  // Raw DTOs only have IDs — build display-ready Appointments once
  // clients/services are loaded, recomputing as any of these change.
  const appointments = useMemo(
    () => appointmentDTOs.map((dto) => transformAppointment(dto, clients, services)),
    [appointmentDTOs, clients, services]
  );

  const visibleStaff = useMemo(
    () => (selectedStaff === "all" ? staff : staff.filter((s) => s.id === selectedStaff)),
    [staff, selectedStaff]
  );

  const visibleAppointments = useMemo(
    () => (selectedStaff === "all" ? appointments : appointments.filter((a) => a.staff_id === selectedStaff)),
    [appointments, selectedStaff]
  );

  function shiftDate(delta: number) {
    setRefDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + delta * (view === "week" ? 7 : 1));
      return next;
    });
  }

  function handleCreated() {
    refreshAppointments();
  }

  return (
    <div className="bg-[#FAFAF8]">
      {/* This renders inside your existing (protected)/layout.tsx, alongside Sidebar.
          Drop the outer min-h-screen/bg here if your layout already sets that. */}
      <div className="max-w-6xl mx-auto">
        <header className="px-6 pt-6 pb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="font-[Manrope] text-2xl font-bold text-neutral-900">Appointments</h1>
            <div className="flex items-center gap-1 text-sm text-neutral-500">
              <button
                onClick={() => shiftDate(-1)}
                aria-label="Previous"
                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#1D5F55]"
              >
                ‹
              </button>
              <span className="min-w-[9rem] text-center font-medium text-neutral-700">
                {formatRangeLabel(view, refDate)}
              </span>
              <button
                onClick={() => shiftDate(1)}
                aria-label="Next"
                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#1D5F55]"
              >
                ›
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-neutral-200 p-0.5 bg-white">
              {(["day", "week", "list"] as ViewMode[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                    view === v ? "bg-[#1D5F55] text-white" : "text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#1D5F55] hover:bg-[#164A42] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D5F55]"
            >
              + New appointment
            </button>
          </div>
        </header>

        <div className="bg-white rounded-t-xl border border-neutral-200 mx-4">
          <StaffFilter staff={staff} selectedId={selectedStaff} onSelect={setSelectedStaff} />

          {loadingAppointments ? (
            <div className="flex items-center justify-center h-64 text-sm text-neutral-500">
              Loading appointments…
            </div>
          ) : appointmentsError ? (
            <div className="flex flex-col items-center justify-center h-64 text-center px-6">
              <p className="text-sm font-medium text-red-600">{appointmentsError}</p>
              <button
                onClick={refreshAppointments}
                className="mt-3 px-4 py-1.5 rounded-lg text-sm font-medium border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {view === "day" && (
                <DayGrid
                  date={refDate}
                  staff={visibleStaff}
                  appointments={visibleAppointments}
                  onSelectAppointment={setSelectedAppt}
                />
              )}
              {view === "week" && (
                <WeekGrid
                  weekStart={startOfWeek(refDate)}
                  appointments={visibleAppointments}
                  onSelectAppointment={setSelectedAppt}
                />
              )}
              {view === "list" && (
                <ListView appointments={visibleAppointments} onSelectAppointment={setSelectedAppt} />
              )}
            </>
          )}
        </div>
        <div className="h-8" />
      </div>

      <NewAppointmentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleCreated}
        staff={staff}
        services={services}
        clients={clients}
      />

      {selectedAppt && (
        <AppointmentDetail
          appt={selectedAppt}
          onClose={() => setSelectedAppt(null)}
          onStatusChanged={() => {
            setSelectedAppt(null);
            refreshAppointments();
          }}
        />
      )}
    </div>
  );
}

const STATUS_LABEL: Record<Appointment["status"], string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No-show",
};

// Deliberately restrictive — only the transitions that make sense from each
// state. Completed/cancelled/no_show are treated as terminal for now.
const STATUS_TRANSITIONS: Record<Appointment["status"], Appointment["status"][]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "no_show", "cancelled"],
  completed: [],
  cancelled: [],
  no_show: [],
};

function AppointmentDetail({
  appt,
  onClose,
  onStatusChanged,
}: {
  appt: Appointment;
  onClose: () => void;
  onStatusChanged: () => void;
}) {
  const [updating, setUpdating] = useState<Appointment["status"] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const nextOptions = STATUS_TRANSITIONS[appt.status];

  async function handleStatusChange(status: Appointment["status"]) {
    setUpdating(status);
    setError(null);
    try {
      await appointmentsApi.updateStatus(appt.id, status);
      onStatusChanged();
    } catch (e) {
      setError("Couldn't update the status. Try again.");
      setUpdating(null);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-base font-semibold text-neutral-800 mb-1">{appt.client_name}</h2>
        <p className="text-sm text-neutral-500 mb-4">{appt.service_name}</p>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-neutral-500">Time</dt>
            <dd className="text-neutral-800">
              {new Date(appt.start_time).toLocaleString(undefined, {
                weekday: "short",
                hour: "numeric",
                minute: "2-digit",
              })}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-500">Duration</dt>
            <dd className="text-neutral-800">{appt.duration_minutes} min</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-500">Status</dt>
            <dd className="text-neutral-800">{STATUS_LABEL[appt.status]}</dd>
          </div>
        </dl>

        {nextOptions.length > 0 && (
          <div className="mt-4 pt-4 border-t border-neutral-100">
            <p className="text-xs font-medium text-neutral-500 mb-2">Update status</p>
            <div className="flex flex-wrap gap-2">
              {nextOptions.map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={updating !== null}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium border border-neutral-300 text-neutral-700 hover:border-[#1D5F55] hover:text-[#1D5F55] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {updating === status ? "Saving…" : `Mark ${STATUS_LABEL[status]}`}
                </button>
              ))}
            </div>
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-5 w-full px-4 py-2 rounded-lg text-sm font-medium text-neutral-600 border border-neutral-300 hover:bg-neutral-50"
        >
          Close
        </button>
      </div>
    </div>
  );
}
