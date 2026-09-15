// app/(protected)/staff/types.ts
//
// Mirrors app/models/staff.py exactly: id, user_id, full_name, contact,
// email, social_media_link, is_active, created_at.

export interface StaffMember {
  id: number;
  user_id: number;
  full_name: string;
  contact?: string | null;
  email?: string | null;
  social_media_link?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface CreateStaffPayload {
  user_id: number;
  full_name: string;
  contact?: string;
  email?: string;
  social_media_link?: string;
  is_active: boolean;
}

export type UpdateStaffPayload = Partial<Omit<CreateStaffPayload, "user_id">>;

// --- Staff scheduling ---
// Matches the row shape confirmed against your database (staff_schedules
// table: id, staff_id, day_of_week, start_time, end_time, is_active,
// created_at). day_of_week follows Python's date.weekday() convention:
// Monday=0 ... Sunday=6 (confirmed live — see conversation history).
//
// IMPORTANT: /staff-schedules only has POST. There is no GET/PATCH/DELETE,
// so this UI cannot show you which days are already scheduled, and cannot
// stop you from creating a duplicate row for a day you've already set.

export interface CreateStaffScheduleInput {
  staff_id: number;
  day_of_week: number; // 0=Mon ... 6=Sun
  start_time: string; // "HH:MM:SS"
  end_time: string; // "HH:MM:SS"
}

export const WEEKDAYS: { value: number; label: string }[] = [
  { value: 0, label: "Monday" },
  { value: 1, label: "Tuesday" },
  { value: 2, label: "Wednesday" },
  { value: 3, label: "Thursday" },
  { value: 4, label: "Friday" },
  { value: 5, label: "Saturday" },
  { value: 6, label: "Sunday" },
];