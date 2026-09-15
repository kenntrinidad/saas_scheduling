// app/(protected)/services/types.ts

export interface Service {
  id: number;
  name: string;
  duration_minutes: number;
  price: number;
  is_active: boolean;
}

export interface CreateServicePayload {
  name: string;
  duration_minutes: number;
  price: number;
  is_active: boolean;
}