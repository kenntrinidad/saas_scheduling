// app/appointments/mock-data.ts
//
// Stand-in data so the calendar renders something meaningful today.
// Swap for a real `listAppointments` call once that endpoint exists (see api.ts).

import type { Appointment, Staff, Service } from "./types";

export const mockStaff: Staff[] = [
  { id: 1, full_name: "Maria Santos", color: "#1D5F55" },
  { id: 2, full_name: "Jake Rivera", color: "#7C5CBF" },
  { id: 3, full_name: "Ana Cruz", color: "#B45309" },
];

export const mockServices: Service[] = [
  { id: 1, name: "Haircut", duration_minutes: 30, price: 200, is_active: true },
  { id: 2, name: "Color", duration_minutes: 90, price: 1200, is_active: true },
  { id: 3, name: "Manicure", duration_minutes: 45, price: 350, is_active: true },
];

function todayAt(hour: number, minute: number): string {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export const mockAppointments: Appointment[] = [
  {
    id: 1,
    staff_id: 1,
    client_id: 1,
    client_name: "Trinidad Reyes",
    service_id: 2,
    service_name: "Color",
    start_time: todayAt(9, 30),
    duration_minutes: 90,
    status: "confirmed",
  },
  {
    id: 2,
    staff_id: 2,
    client_id: 2,
    client_name: "Carlo Dizon",
    service_id: 1,
    service_name: "Haircut",
    start_time: todayAt(9, 0),
    duration_minutes: 30,
    status: "pending",
  },
  {
    id: 3,
    staff_id: 3,
    client_id: 3,
    client_name: "Beth Ramos",
    service_id: 3,
    service_name: "Manicure",
    start_time: todayAt(10, 0),
    duration_minutes: 45,
    status: "completed",
  },
  {
    id: 4,
    staff_id: 1,
    client_id: 4,
    client_name: "Ana Villar",
    service_id: 1,
    service_name: "Haircut",
    start_time: todayAt(13, 0),
    duration_minutes: 30,
    status: "cancelled",
  },
];