// app/appointments/components/CalendarGrid.tsx
"use client";

import type { Appointment, Staff, AppointmentStatus } from "../types";

const OPEN_HOUR = 9;
const CLOSE_HOUR = 19;
const ROW_HEIGHT = 48; // px per 30-minute slot
const SLOT_MINUTES = 30;

const STATUS_STYLES: Record<AppointmentStatus, { bg: string; border: string; text: string }> = {
  confirmed: { bg: "#E9F2EF", border: "#1D5F55", text: "#14453C" },
  pending: { bg: "#FBF0DE", border: "#B45309", text: "#7C3D06" },
  completed: { bg: "#F1F1EF", border: "#6B7280", text: "#4B5157" },
  cancelled: { bg: "#FBE9E9", border: "#DC2626", text: "#8F1D1D" },
  no_show: { bg: "#F1EAF6", border: "#7C5CBF", text: "#4A2E77" },
};

function timeRows(): string[] {
  const rows: string[] = [];
  for (let h = OPEN_HOUR; h < CLOSE_HOUR; h++) {
    rows.push(`${h.toString().padStart(2, "0")}:00`);
    rows.push(`${h.toString().padStart(2, "0")}:30`);
  }
  return rows;
}

function minutesFromOpen(iso: string): number {
  const d = new Date(iso);
  return (d.getHours() - OPEN_HOUR) * 60 + d.getMinutes();
}

function formatHourLabel(row: string): string {
  const [h, m] = row.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hour12} ${period}` : "";
}

interface AppointmentBlockProps {
  appt: Appointment;
  onSelect?: (appt: Appointment) => void;
}

function AppointmentBlock({ appt, onSelect }: AppointmentBlockProps) {
  const style = STATUS_STYLES[appt.status];
  const top = (minutesFromOpen(appt.start_time) / SLOT_MINUTES) * ROW_HEIGHT;
  const height = Math.max((appt.duration_minutes / SLOT_MINUTES) * ROW_HEIGHT - 4, 28);

  return (
    <button
      onClick={() => onSelect?.(appt)}
      className="absolute left-1 right-1 rounded-md border-l-4 px-2 py-1 text-left text-xs leading-tight shadow-sm hover:shadow-md transition-shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#1D5F55]"
      style={{
        top,
        height,
        backgroundColor: style.bg,
        borderColor: style.border,
        color: style.text,
      }}
      title={`${appt.client_name} — ${appt.service_name}`}
    >
      <span className="block font-semibold truncate">{appt.client_name}</span>
      <span className="block truncate opacity-80">{appt.service_name}</span>
    </button>
  );
}

interface DayGridProps {
  date: Date;
  staff: Staff[];
  appointments: Appointment[];
  onSelectAppointment?: (appt: Appointment) => void;
}

/** Day view: staff members as columns, 30-minute rows. */
export function DayGrid({ date, staff, appointments, onSelectAppointment }: DayGridProps) {
  const rows = timeRows();
  const dayKey = date.toDateString();
  const dayAppointments = appointments.filter((a) => new Date(a.start_time).toDateString() === dayKey);

  if (staff.length === 0) {
    return <EmptyGridState message="No staff to show. Select at least one staff member." />;
  }

  return (
    <div className="overflow-x-auto">
      <div
        className="grid min-w-[640px]"
        style={{ gridTemplateColumns: `72px repeat(${staff.length}, minmax(160px, 1fr))` }}
      >
        {/* header row */}
        <div className="sticky top-0 bg-white border-b border-neutral-200" />
        {staff.map((member) => (
          <div
            key={member.id}
            className="sticky top-0 bg-white border-b border-l border-neutral-200 px-3 py-2 text-sm font-semibold text-neutral-800"
          >
            {member.full_name}
          </div>
        ))}

        {/* time column */}
        <div className="relative border-r border-neutral-200">
          {rows.map((row) => (
            <div
              key={row}
              className="border-b border-neutral-100 text-[11px] text-neutral-400 pr-2 text-right pt-0.5"
              style={{ height: ROW_HEIGHT }}
            >
              {formatHourLabel(row)}
            </div>
          ))}
        </div>

        {/* staff columns */}
        {staff.map((member) => (
          <div key={member.id} className="relative border-l border-neutral-200">
            {rows.map((row) => (
              <div key={row} className="border-b border-neutral-100" style={{ height: ROW_HEIGHT }} />
            ))}
            {dayAppointments
              .filter((a) => a.staff_id === member.id)
              .map((appt) => (
                <AppointmentBlock key={appt.id} appt={appt} onSelect={onSelectAppointment} />
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}

interface WeekGridProps {
  weekStart: Date;
  appointments: Appointment[];
  onSelectAppointment?: (appt: Appointment) => void;
}

/** Week view: 7 days as columns (all filtered staff combined per day). */
export function WeekGrid({ weekStart, appointments, onSelectAppointment }: WeekGridProps) {
  const rows = timeRows();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[900px]" style={{ gridTemplateColumns: `72px repeat(7, minmax(120px, 1fr))` }}>
        <div className="sticky top-0 bg-white border-b border-neutral-200" />
        {days.map((d) => (
          <div
            key={d.toISOString()}
            className="sticky top-0 bg-white border-b border-l border-neutral-200 px-2 py-2 text-sm font-semibold text-neutral-800"
          >
            {d.toLocaleDateString(undefined, { weekday: "short", day: "numeric" })}
          </div>
        ))}

        <div className="relative border-r border-neutral-200">
          {rows.map((row) => (
            <div
              key={row}
              className="border-b border-neutral-100 text-[11px] text-neutral-400 pr-2 text-right pt-0.5"
              style={{ height: ROW_HEIGHT }}
            >
              {formatHourLabel(row)}
            </div>
          ))}
        </div>

        {days.map((d) => {
          const dayKey = d.toDateString();
          const dayAppointments = appointments.filter((a) => new Date(a.start_time).toDateString() === dayKey);
          return (
            <div key={d.toISOString()} className="relative border-l border-neutral-200">
              {rows.map((row) => (
                <div key={row} className="border-b border-neutral-100" style={{ height: ROW_HEIGHT }} />
              ))}
              {dayAppointments.map((appt) => (
                <AppointmentBlock key={appt.id} appt={appt} onSelect={onSelectAppointment} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EmptyGridState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-64 text-sm text-neutral-500">{message}</div>
  );
}
