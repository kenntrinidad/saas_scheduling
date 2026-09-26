"use client";

import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1$/, "") || "http://127.0.0.1:8000";

export default function DashboardPage() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    fetch(`${API_BASE}/`)
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage("Cannot connect to backend"));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      <p className="mt-4 text-gray-600">Backend status:</p>
      <p className="mt-2 font-medium text-blue-600">{message}</p>
    </div>
  );
}