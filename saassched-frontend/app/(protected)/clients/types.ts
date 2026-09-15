// app/(protected)/clients/types.ts

export interface Client {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
}

export interface CreateClientPayload {
  full_name: string;
  email: string;
  phone?: string;
}

export type UpdateClientPayload = Partial<CreateClientPayload>;