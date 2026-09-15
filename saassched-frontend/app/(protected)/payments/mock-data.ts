// app/(protected)/payments/mock-data.ts
import type { Payment } from "./types";

function daysAgo(n: number, hour: number, minute: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export const mockPayments: Payment[] = [
  {
    id: 1,
    client_id: 1,
    client_name: "Trinidad Reyes",
    service_summary: "Haircut + Color",
    amount: 1400,
    method: "cash",
    paid_at: daysAgo(0, 10, 30),
  },
  {
    id: 2,
    client_id: 2,
    client_name: "Carlo Dizon",
    service_summary: "Manicure",
    amount: 350,
    method: "gcash",
    paid_at: daysAgo(1, 14, 0),
  },
  {
    id: 3,
    client_id: 3,
    client_name: "Beth Ramos",
    service_summary: "Haircut",
    amount: 200,
    method: "card",
    paid_at: daysAgo(1, 9, 15),
  },
  {
    id: 4,
    client_id: 4,
    client_name: "Ana Villar",
    service_summary: "Color",
    amount: 1200,
    method: "cash",
    paid_at: daysAgo(3, 16, 45),
  },
];