// app/(protected)/clients/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { ClientTable } from "./components/ClientTable";
import { ClientFormModal } from "./components/ClientFormModal";
import { clientsApi } from "./api";
import type { Client } from "./types";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  function refresh() {
    setLoading(true);
    setLoadError(null);
    clientsApi
      .list()
      .then(setClients)
      .catch(() => setLoadError("Couldn't load clients. Check your connection and try again."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(
      (c) =>
        c.full_name.toLowerCase().includes(q) ||
        (c.email ?? "").toLowerCase().includes(q) ||
        (c.phone ?? "").toLowerCase().includes(q)
    );
  }, [clients, search]);

  function openAdd() {
    setEditingClient(null);
    setModalOpen(true);
  }

  function openEdit(client: Client) {
    setEditingClient(client);
    setModalOpen(true);
  }

  return (
    <div className="bg-[#FAFAF8]">
      <div className="max-w-4xl mx-auto">
        <header className="px-6 pt-6 pb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-[Manrope] text-2xl font-bold text-neutral-900">Clients</h1>
          <button
            onClick={openAdd}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#1D5F55] hover:bg-[#164A42] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D5F55]"
          >
            + Add client
          </button>
        </header>

        <div className="bg-white rounded-t-xl border border-neutral-200 mx-4">
          <div className="px-6 py-3 border-b border-neutral-200">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or phone…"
              aria-label="Search clients"
              className="w-full max-w-sm rounded-lg border border-neutral-300 bg-white text-neutral-900 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D5F55]"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64 text-sm text-neutral-500">
              Loading clients…
            </div>
          ) : loadError ? (
            <div className="flex flex-col items-center justify-center h-64 text-center px-6">
              <p className="text-sm font-medium text-red-600">{loadError}</p>
              <button
                onClick={refresh}
                className="mt-3 px-4 py-1.5 rounded-lg text-sm font-medium border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
              >
                Retry
              </button>
            </div>
          ) : (
            <ClientTable clients={filtered} onSelect={openEdit} />
          )}
        </div>
        <div className="h-8" />
      </div>

      <ClientFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={refresh}
        client={editingClient}
      />
    </div>
  );
}