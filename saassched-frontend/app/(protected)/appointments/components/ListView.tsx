// app/appointments/components/ListView.tsx
"use client";

import type { Appointment, AppointmentStatus } from "../types";

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  confirmed: "Confirmed",
  pending: "Pending",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No-show",
};

const STATUS_DOT: Record<AppointmentStatus, string> = {
  confirmed: "#1D5F55",
  pending: "#B45309",
  completed: "#6B7280",
  cancelled: "#DC2626",
  no_show: "#7C5CBF",
};

interface ListViewProps {
  appointments: Appointment[];
  onSelectAppointment?: (appt: Appointment) => void;
}

export function ListView({ appointments, onSelectAppointment }: ListViewProps) {
  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center px-6">
        <p className="text-sm font-medium text-neutral-700">No appointments in this range</p>
        <p className="text-sm text-neutral-500 mt-1">New bookings will show up here as they come in.</p>
      </div>
    );
  }

  const sorted = [...appointments].sort(
    (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  const groups = sorted.reduce<Record<string, Appointment[]>>((acc, appt) => {
    const key = new Date(appt.start_time).toDateString();
    acc[key] = acc[key] ?? [];
    acc[key].push(appt);
    return acc;
  }, {});

  return (
    <div className="divide-y divide-neutral-100">
      {Object.entries(groups).map(([dateKey, items]) => (
        <div key={dateKey} className="px-6 py-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-2">
            {new Date(dateKey).toLocaleDateString(undefined, {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </h3>
          <ul className="space-y-1">
            {items.map((appt) => (
              <li key={appt.id}>
                <button
                  onClick={() => onSelectAppointment?.(appt)}
                  className="w-full flex items-center justify-between gap-3 rounded-lg px-3 py-2 hover:bg-neutral-50 transition-colors text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#1D5F55]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      aria-hidden="true"
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: STATUS_DOT[appt.status] }}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-neutral-800 truncate">{appt.client_name}</p>
                      <p className="text-xs text-neutral-500 truncate">{appt.service_name}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm text-neutral-700">
                      {new Date(appt.start_time).toLocaleTimeString(undefined, {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-xs text-neutral-400">{STATUS_LABEL[appt.status]}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
