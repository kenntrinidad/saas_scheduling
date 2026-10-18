"use client";

import { useState } from "react";
import Script from "next/script";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export default function PublicBookPage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    const preferred_time = `${date}T${time}:00+08:00`;

    try {
      const res = await fetch(`${API_BASE}/public/booking-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          phone: phone || null,
          email: email || null,
          preferred_time,
          notes: notes || null,
        }),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(body || "Failed to submit request");
      }

      setSuccess(true);
      setFullName("");
      setPhone("");
      setEmail("");
      setDate("");
      setTime("09:00");
      setNotes("");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] px-4 py-10">
      <div className="mx-auto w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-neutral-900">Welcome! Schedule Your Appointment</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Experience how your clients will easily book appointments with your clinic, spa, or salon in real time.
        </p>

        {success && (
          <div className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Request received. Please wait for the shop to confirm your appointment.
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Field label="Full name *">
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1D5F55]"
              placeholder="Your name"
            />
          </Field>

          <Field label="Phone">
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1D5F55]"
              placeholder="09XXXXXXXXX"
            />
          </Field>

          <Field label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1D5F55]"
              placeholder="you@email.com"
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Preferred date *">
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1D5F55]"
              />
            </Field>
            <Field label="Preferred time *">
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1D5F55]"
              />
            </Field>
          </div>

          <Field label="Notes">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1D5F55]"
              placeholder="Service wanted, preferred staff, or other details"
            />
          </Field>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-[#1D5F55] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#164A42] disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit request"}
          </button>
          <p className="mt-2 text-sm text-neutral-500">
            Want this seamless booking system for your business? Contact us today to set up yours!
          </p>
        </form>
      </div>

      {/* External AI Chat Widget Script */}
      <script
        src="http://127.0.0.1:8001/static/chat-widget.js"
        defer
        data-agent-id="c3863181-013f-4382-b120-befd3b881293"
        data-widget-token="hTwzgaPi3quTGBhz66x5pAZSXJqMNA2U2fkm1i4Ctvw"
        data-webhook-url="http://127.0.0.1:8001/api/public/agents/c3863181-013f-4382-b120-befd3b881293/chat"
      ></script>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-neutral-500">{label}</span>
      {children}
    </label>
  );
}