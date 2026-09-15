// app/(protected)/staff/components/StaffGrid.tsx
"use client";

import type { StaffMember } from "../types";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

// Deterministic accent per staff id so avatars don't all look identical.
const AVATAR_COLORS = ["#1D5F55", "#7C5CBF", "#B45309", "#2563A8", "#9D4E4E"];
function avatarColor(id: number): string {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

interface StaffGridProps {
  staff: StaffMember[];
  onSelect: (member: StaffMember) => void;
  onSchedule: (member: StaffMember) => void;
}

export function StaffGrid({ staff, onSelect, onSchedule }: StaffGridProps) {
  if (staff.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center px-6">
        <p className="text-sm font-medium text-neutral-700">No staff match this view</p>
        <p className="text-sm text-neutral-500 mt-1">Try a different filter or search.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-6 py-5">
      {staff.map((member) => (
        <div
          key={member.id}
          className="rounded-xl border border-neutral-200 overflow-hidden hover:border-[#1D5F55] hover:shadow-sm transition-all"
        >
          <button
            onClick={() => onSelect(member)}
            className="w-full text-left p-4 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#1D5F55]"
          >
            <div className="flex items-start justify-between gap-2">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0"
                style={{ backgroundColor: avatarColor(member.id) }}
                aria-hidden="true"
              >
                {initials(member.full_name)}
              </div>
              {!member.is_active && (
                <span className="rounded-full bg-neutral-100 text-neutral-500 text-xs font-medium px-2 py-0.5 shrink-0">
                  Inactive
                </span>
              )}
            </div>
            <p className="mt-3 text-[15px] font-medium text-neutral-800 truncate">{member.full_name}</p>
            {member.email && <p className="text-sm text-neutral-500 truncate">{member.email}</p>}
            {member.contact && <p className="text-sm text-neutral-500 truncate">{member.contact}</p>}
          </button>
          <button
            onClick={() => onSchedule(member)}
            className="w-full border-t border-neutral-100 px-4 py-2 text-xs font-medium text-neutral-500 hover:text-[#1D5F55] hover:bg-neutral-50 transition-colors text-left focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#1D5F55]"
          >
            Set schedule →
          </button>
        </div>
      ))}
    </div>
  );
}