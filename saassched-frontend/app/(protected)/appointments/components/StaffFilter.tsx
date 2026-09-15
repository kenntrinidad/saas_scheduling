// app/appointments/components/StaffFilter.tsx
"use client";

import type { Staff } from "../types";

interface StaffFilterProps {
  staff: Staff[];
  selectedId: number | "all";
  onSelect: (id: number | "all") => void;
}

export function StaffFilter({ staff, selectedId, onSelect }: StaffFilterProps) {
  return (
    <div
      role="tablist"
      aria-label="Filter by staff"
      className="flex flex-wrap gap-2 px-6 py-3 border-b border-neutral-200"
    >
      <button
        role="tab"
        aria-selected={selectedId === "all"}
        onClick={() => onSelect("all")}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D5F55] ${
          selectedId === "all"
            ? "bg-[#1D5F55] text-white"
            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
        }`}
      >
        All staff
      </button>
      {staff.map((member) => {
        const active = selectedId === member.id;
        return (
          <button
            key={member.id}
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(member.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D5F55] ${
              active ? "text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
            style={active ? { backgroundColor: member.color ?? "#1D5F55" } : undefined}
          >
            <span
              aria-hidden="true"
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: active ? "rgba(255,255,255,0.8)" : member.color ?? "#1D5F55" }}
            />
            {member.full_name}
          </button>
        );
      })}
    </div>
  );
}
