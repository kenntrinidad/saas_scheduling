"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col">
      <div className="mb-10">
        <h1 className="text-xl font-bold text-gray-800">Software As Service</h1>
        <p className="text-sm text-gray-500 mt-1">Scheduling System for Clinic, Spa, and Beauty Salons</p>
      </div>

      <nav className="space-y-2 flex-1">
        <Link href="/" className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
          Dashboard
        </Link>
        <Link href="/appointments" className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
          Appointments
        </Link>
        <Link href="/clients" className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
          Clients
        </Link>
        <Link href="/staff" className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
          Staff
        </Link>
        <Link href="/services" className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
          Services
        </Link>
        <Link href="/payments" className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
          Payments
        </Link>
      </nav>

      <button
        onClick={handleLogout}
        className="mt-6 w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg"
      >
        Logout
      </button>
    </aside>
  );
}