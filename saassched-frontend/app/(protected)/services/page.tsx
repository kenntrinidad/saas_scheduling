// app/(protected)/services/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { ServiceMenuList } from "./components/ServiceMenuList";
import { NewServiceModal } from "./components/NewServiceModal";
import { servicesApi } from "./api";
import type { Service } from "./types";

type StatusFilter = "all" | "active" | "inactive";

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [modalOpen, setModalOpen] = useState(false);

  function refresh() {
    setLoading(true);
    setLoadError(null);
    servicesApi
      .list()
      .then(setServices)
      .catch(() => setLoadError("Couldn't load services. Check your connection and try again."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    return services.filter((s) => {
      if (status === "active" && !s.is_active) return false;
      if (status === "inactive" && s.is_active) return false;
      if (search.trim() && !s.name.toLowerCase().includes(search.trim().toLowerCase())) return false;
      return true;
    });
  }, [services, search, status]);

  return (
    <div className="bg-[#FAFAF8]">
      <div className="max-w-3xl mx-auto">
        <header className="px-3 pt-3 pb-4 flex flex-wrap items-center justify-between gap-3 sm:px-6 sm:pt-6">
          <h1 className="hidden text-2xl font-bold text-neutral-900 md:block">Services</h1>
          <button
            onClick={() => setModalOpen(true)}
            className="min-h-11 px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#1D5F55] hover:bg-[#164A42] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D5F55]"
          >
            + Add service
          </button>
        </header>

        <div className="bg-white rounded-xl border border-neutral-200 mx-1 sm:mx-4">
          <div className="flex flex-col items-stretch gap-3 px-3 py-3 border-b border-neutral-200 sm:flex-row sm:flex-wrap sm:items-center sm:px-6">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services…"
              aria-label="Search services"
              className="min-h-11 w-full min-w-0 flex-1 rounded-lg border border-neutral-300 bg-white text-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D5F55] sm:min-w-[160px]"
            />
            <div className="flex rounded-lg border border-neutral-200 p-0.5">
              {(["all", "active", "inactive"] as StatusFilter[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`min-h-11 px-3 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
                    status === s ? "bg-[#1D5F55] text-white" : "text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64 text-sm text-neutral-500">
              Loading services…
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
            <ServiceMenuList services={filtered} />
          )}
        </div>
        <div className="h-8" />
      </div>

      <NewServiceModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={refresh} />
    </div>
  );
}
