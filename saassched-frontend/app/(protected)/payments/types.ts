// app/(protected)/payments/types.ts
//
// Confirmed live against app/schemas/payment.py and app/models/payment.py.

export type PaymentMethod = "cash" | "gcash" | "card";
export type PaymentStatus = "paid" | "refunded";

// --- Raw shape returned by the API (PaymentOut) ---
// No client name, no service info — only IDs + amount/method/status/notes.
// `amount` is a Decimal on the backend; Pydantic/FastAPI serializes Decimal
// as a JSON string, not a number, so this must be typed and parsed as such.
export interface PaymentDTO {
  id: number;
  client_id: number;
  appointment_id: number | null;
  amount: string; // Decimal -> string over the wire
  method: PaymentMethod;
  status: PaymentStatus;
  notes: string | null;
  paid_at: string; // ISO datetime
}

// UI-ready shape, with the client name resolved from the clients list this
// page already fetches (same pattern as Appointments' transformAppointment).
export interface Payment {
  id: number;
  client_id: number;
  client_name: string;
  appointment_id: number | null;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  notes: string | null;
  paid_at: string;
  service_summary?: string;
}

export interface Client {
  id: number;
  full_name: string;
}

export function transformPayment(dto: PaymentDTO, clients: Client[]): Payment {
  const client = clients.find((c) => c.id === dto.client_id);
  return {
    id: dto.id,
    client_id: dto.client_id,
    client_name: client?.full_name ?? `Client #${dto.client_id}`,
    appointment_id: dto.appointment_id,
    amount: Number(dto.amount),
    method: dto.method,
    status: dto.status,
    notes: dto.notes,
    paid_at: dto.paid_at,
  };
}

// Matches PaymentCreate exactly.
export interface RecordPaymentInput {
  client_id: number;
  appointment_id?: number;
  amount: number;
  method: PaymentMethod;
  notes?: string;
}