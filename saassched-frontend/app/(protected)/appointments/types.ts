// app/(protected)/appointments/types.ts

export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled" | "no_show";

export interface Staff {
  id: number;
  full_name: string;
  color?: string; // optional per-staff accent for the grid column header
}

export interface Service {
  id: number;
  name: string;
  duration_minutes: number;
  price: number;
  is_active: boolean;
}

export interface Client {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
}

export interface Appointment {
  id: number;
  staff_id: number;
  client_id: number;
  client_name: string;
  service_id: number;
  service_name: string;
  start_time: string; // ISO 8601
  duration_minutes: number;
  status: AppointmentStatus;
  notes?: string;
}

export interface AvailabilitySlot {
  // Confirmed against the real API response: plain time-of-day strings
  // ("09:00:00"), no date, keys are `start`/`end` — not `start_time`/`end_time`.
  start: string; // "HH:MM:SS"
  end: string; // "HH:MM:SS"
}

export interface AvailabilityQuery {
  staff_id: number;
  service_id: number;
  target_date: string; // YYYY-MM-DD
}

export interface CreateAppointmentPayload {
  client_id: number;
  staff_id: number;
  service_ids: number[];
  appointment_date: string; // ISO datetime — matches app/schemas/appointment.py's AppointmentCreate
  // NOTE: the backend's AppointmentCreate/AppointmentOut have no `notes` field.
  // Anything typed in the modal's "Notes" box is currently NOT persisted —
  // see INTEGRATION.md.
}

// --- Raw shape returned by the API (app/schemas/appointment.py's AppointmentOut) ---
// Only IDs, no denormalized names — the UI has to look those up itself from
// the already-loaded staff/services/clients lists. See transformAppointment.

export interface AppointmentServiceLine {
  service_id: number;
}

export interface AppointmentDTO {
  id: number;
  client_id: number;
  staff_id: number;
  appointment_date: string; // ISO datetime
  status: AppointmentStatus;
  created_at: string;
  services: AppointmentServiceLine[];
}

/**
 * Converts a raw AppointmentDTO (IDs only) into the UI-ready Appointment
 * shape (names + total duration), using the staff/services/clients lists
 * this page already fetches.
 */
export function transformAppointment(
  dto: AppointmentDTO,
  clients: Client[],
  services: Service[]
): Appointment {
  const client = clients.find((c) => c.id === dto.client_id);
  const matchedServices = dto.services
    .map((line) => services.find((s) => s.id === line.service_id))
    .filter((s): s is Service => Boolean(s));

  const serviceName = matchedServices.length > 0 ? matchedServices.map((s) => s.name).join(" + ") : "—";
  const durationMinutes = matchedServices.reduce((sum, s) => sum + s.duration_minutes, 0);

  return {
    id: dto.id,
    staff_id: dto.staff_id,
    client_id: dto.client_id,
    client_name: client?.full_name ?? `Client #${dto.client_id}`,
    service_id: matchedServices[0]?.id ?? 0,
    service_name: serviceName,
    start_time: dto.appointment_date,
    duration_minutes: durationMinutes,
    status: dto.status,
  };
}