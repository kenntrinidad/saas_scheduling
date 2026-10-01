// app/(protected)/clients/components/ClientTable.tsx
"use client";

import type { Client } from "../types";

interface ClientTableProps {
  clients: Client[];
  onSelect: (client: Client) => void;
}

export function ClientTable({ clients, onSelect }: ClientTableProps) {
  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center px-6">
        <p className="text-sm font-medium text-neutral-700">No clients match this search</p>
        <p className="text-sm text-neutral-500 mt-1">Try a different name, email, or phone number.</p>
      </div>
    );
  }

  return (
    <>
    <ul className="divide-y divide-neutral-100 md:hidden">
      {clients.map((client) => (
        <li key={client.id}>
          <button
            onClick={() => onSelect(client)}
            className="flex min-h-11 w-full flex-col items-start gap-1 px-4 py-3 text-left hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#1D5F55]"
          >
            <span className="font-medium text-neutral-800">{client.full_name}</span>
            <span className="max-w-full break-all text-sm text-neutral-600">{client.email || "No email"}</span>
            <span className="text-sm text-neutral-600">{client.phone || "No phone"}</span>
          </button>
        </li>
      ))}
    </ul>
    <table className="hidden w-full text-sm md:table">
      <thead>
        <tr className="border-b border-neutral-200 text-left text-xs font-medium uppercase tracking-wide text-neutral-400">
          <th className="px-6 py-2 font-medium">Name</th>
          <th className="px-6 py-2 font-medium">Email</th>
          <th className="px-6 py-2 font-medium">Phone</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-neutral-100">
        {clients.map((client) => (
          <tr key={client.id}>
            <td className="p-0">
              <button
                onClick={() => onSelect(client)}
                className="w-full text-left px-6 py-3 hover:bg-neutral-50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#1D5F55]"
              >
                <span className="font-medium text-neutral-800">{client.full_name}</span>
              </button>
            </td>
            <td className="px-6 py-3 text-neutral-600">{client.email}</td>
            <td className="px-6 py-3 text-neutral-600">{client.phone || "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
    </>
  );
}
