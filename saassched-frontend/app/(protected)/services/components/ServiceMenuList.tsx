// app/(protected)/services/components/ServiceMenuList.tsx
"use client";

import type { Service } from "../types";

function formatPrice(price: number): string {
  return `₱${price.toLocaleString()}`;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} hr` : `${hours} hr ${rest} min`;
}

interface ServiceMenuListProps {
  services: Service[];
}

export function ServiceMenuList({ services }: ServiceMenuListProps) {
  if (services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center px-6">
        <p className="text-sm font-medium text-neutral-700">No services match this view</p>
        <p className="text-sm text-neutral-500 mt-1">Try a different filter, or add your first service.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-neutral-100">
      {services.map((service) => (
        <li key={service.id} className="flex items-center justify-between gap-4 px-6 py-4">
          <div className="min-w-0 flex items-center gap-2">
            <span className="text-[15px] font-medium text-neutral-800 truncate">{service.name}</span>
            {!service.is_active && (
              <span className="shrink-0 rounded-full bg-neutral-100 text-neutral-500 text-xs font-medium px-2 py-0.5">
                Inactive
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-3 shrink-0 text-sm">
            <span className="text-neutral-400">{formatDuration(service.duration_minutes)}</span>
            <span className="font-semibold text-neutral-800">{formatPrice(service.price)}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
