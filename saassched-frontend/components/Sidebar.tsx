"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

const links = [
  ["/", "Dashboard"],
  ["/appointments", "Appointments"],
  ["/booking-requests", "Booking Requests"],
  ["/clients", "Clients"],
  ["/staff", "Staff"],
  ["/services", "Services"],
  ["/payments", "Payments"],
] as const;

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const pageTitle =
    links.find(([href]) => href === pathname)?.[1] ?? "Scheduling";

  // Load pending booking request count
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    let cancelled = false;
    fetch(`${API_BASE}/booking-requests/pending-count`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || data == null) return;
        if (typeof data === "number") setPendingCount(data);
        else if (typeof data.count === "number") setPendingCount(data.count);
        else if (typeof data.pending_count === "number")
          setPendingCount(data.pending_count);
      })
      .catch(() => {
        /* ignore badge errors */
      });

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    const menuButton = menuButtonRef.current;
    closeButtonRef.current?.focus();
    const handleDrawerKeys = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
      if (event.key !== "Tab") return;
      const focusable = drawerRef.current?.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled])"
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleDrawerKeys);
    return () => {
      window.removeEventListener("keydown", handleDrawerKeys);
      menuButton?.focus();
    };
  }, [drawerOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-30 grid h-14 grid-cols-[44px_1fr_44px] items-center border-b border-gray-200 bg-white px-2 md:hidden">
        <button
          ref={menuButtonRef}
          type="button"
          aria-label="Open navigation menu"
          aria-expanded={drawerOpen}
          aria-controls="mobile-navigation"
          onClick={() => setDrawerOpen(true)}
          className="flex size-11 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1D5F55]"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="size-6"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="truncate text-center text-base font-semibold text-gray-800">
          {pageTitle}
        </h1>
        <span aria-hidden="true" />
      </header>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 size-full bg-black/30"
          />
          <aside
            ref={drawerRef}
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Main navigation"
            className="relative flex h-full w-[min(20rem,85vw)] flex-col border-r border-gray-200 bg-white p-5 shadow-xl"
          >
            <div className="mb-8 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Appointment and Scheduling System
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Scheduling System for Clinic, Spa, Beauty Salons and Barber
                  Shops
                </p>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                aria-label="Close navigation menu"
                onClick={() => setDrawerOpen(false)}
                className="flex size-11 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
              >
                <span aria-hidden="true" className="text-2xl leading-none">
                  ×
                </span>
              </button>
            </div>
            <NavigationLinks
              pathname={pathname}
              pendingCount={pendingCount}
              onNavigate={() => setDrawerOpen(false)}
            />
            <LogoutButton onLogout={handleLogout} />
          </aside>
        </div>
      )}

      <aside className="hidden w-64 shrink-0 flex-col border-r border-gray-200 bg-white p-6 md:flex">
        <div className="mb-10">
          <h1 className="text-xl font-bold text-gray-800">
            Appointment and Scheduling System
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Scheduling System for Clinic, Spa, Beauty Salons and Barber Shops
          </p>
        </div>

        <NavigationLinks pathname={pathname} pendingCount={pendingCount} />
        <LogoutButton onLogout={handleLogout} />
      </aside>
    </>
  );
}

function NavigationLinks({
  pathname,
  pendingCount,
  onNavigate,
}: {
  pathname: string;
  pendingCount: number;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="Main navigation" className="flex-1 space-y-1">
      {links.map(([href, label]) => {
        const isActive = href === pathname;
        const showBadge = href === "/booking-requests" && pendingCount > 0;
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={`flex min-h-11 items-center justify-between rounded-lg px-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1D5F55] ${
              isActive
                ? "bg-gray-100 font-medium text-gray-900"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span>{label}</span>
            {showBadge && (
              <span className="ml-2 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white">
                {pendingCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function LogoutButton({ onLogout }: { onLogout: () => void }) {
  return (
    <button
      onClick={onLogout}
      className="mt-6 min-h-11 w-full rounded-lg px-4 text-left text-red-600 hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1D5F55]"
    >
      Logout
    </button>
  );
}