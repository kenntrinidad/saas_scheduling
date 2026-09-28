// Matches app/schemas/dashboard.py exactly.

export interface StaffWeekMonth {
  unique_available: number;
  daily: number[];
}

export interface StaffSummary {
  available_today: number;
  total_staff: number;
  week: StaffWeekMonth;
  month: StaffWeekMonth;
}

export interface AppointmentSummary {
  confirmed_today: number;
  confirmed_week: number;
  confirmed_month: number;
  unique_clients_today: number;
  unique_clients_week: number;
  unique_clients_month: number;
}

export interface EarningsSummary {
  today: string; // Decimal -> string over the wire
  week: string;
  month: string;
}

export interface DashboardSummary {
  staff: StaffSummary;
  appointments: AppointmentSummary;
  earnings: EarningsSummary;
}

export interface DashboardEarnings {
  start_date: string;
  end_date: string;
  total_earnings: string;
}

export type SystemStatus = "checking" | "online" | "offline";
