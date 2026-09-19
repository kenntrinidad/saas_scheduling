// app/(protected)/clients/types.ts

// Raw shape returned by the API (ClientOut)
export interface ClientDTO {
  id: number;
  full_name: string;
  contacts: string | null;
  email: string | null;
  notes: string | null;
  preferences: string | null;
  tags: string | null;
  created_at: string;
  updated_at: string | null;
}

// UI-ready shape
export interface Client {
  id: number;
  full_name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  preferences: string | null;
  tags: string | null;
  created_at: string;
  updated_at: string | null;
}

export function transformClient(dto: ClientDTO): Client {
  return {
    id: dto.id,
    full_name: dto.full_name,
    phone: dto.contacts,
    email: dto.email,
    notes: dto.notes,
    preferences: dto.preferences,
    tags: dto.tags,
    created_at: dto.created_at,
    updated_at: dto.updated_at,
  };
}

export interface CreateClientPayload {
  full_name: string;
  contacts?: string;
  email?: string;
  notes?: string;
  preferences?: string;
  tags?: string;
}

export type UpdateClientPayload = Partial<CreateClientPayload>;