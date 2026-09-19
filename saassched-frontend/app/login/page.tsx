"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// const API_BASE = "http://127.0.0.1:8000";
const API_BASE = "https://saas-scheduling.onrender.com";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("username", email);
      formData.append("password", password);

      const response = await fetch(`${API_BASE}/api/v1/auth/login`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Login failed");
      }

      // Save the token
      localStorage.setItem("token", data.access_token);

      // Redirect to Dashboard
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-3 sm:p-6 lg:grid lg:place-items-center lg:p-10">
      <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl lg:min-h-[720px] lg:grid-cols-[1.05fr_0.95fr]">
        {/* Left: Business / System overview */}
        <section className="relative flex min-h-[340px] flex-col justify-between overflow-hidden bg-slate-900 p-7 text-white sm:p-10 lg:p-14">
          <div className="absolute -right-28 -top-24 h-72 w-72 rounded-full border border-white/10" />
          <div className="absolute -right-8 -top-5 h-48 w-48 rounded-full border border-white/10" />

          <div className="relative flex items-center gap-3">
            <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-emerald-400 text-slate-900">
              {/* Calendar icon */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true">
                <path d="M8 2v4" /><path d="M16 2v4" />
                <rect width="18" height="18" x="3" y="4" rx="2" />
                <path d="M3 10h18" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xl font-bold">Appointment and Scheduling System</p>
              <p className="text-xs text-slate-400">by TND Graphics and Marketing Solutions</p>
            </div>
          </div>

          <div className="relative my-10 max-w-lg lg:my-0">
            <p className="mb-4 text-sm font-semibold uppercase text-emerald-400">Your business, on time</p>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
              Appointments. Staff. Payments. All-In-One.
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-slate-400">
              Keep your calendar full, your team organized, and your revenue on track.
            </p>
          </div>

          <div className="relative grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {[
              { title: "Smart scheduling", description: "Keep availability organized" },
              { title: "Secure access", description: "Protected business records" },
              { title: "Always in sync", description: "One reliable source of truth" },
            ].map((feature) => (
              <div key={feature.title} className="border-l-2 border-emerald-400 pl-3">
                <p className="text-sm font-semibold">{feature.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Right: Login form */}
        <section className="flex items-center justify-center px-6 py-12 sm:px-12 lg:px-16">
          <div className="w-full max-w-md">
            <div className="mb-6">
              <p className="text-sm font-semibold text-blue-600">Welcome back</p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">Sign in to continue</h2>
              <p className="mt-2 text-sm text-gray-500">Use your scheduler server account below.</p>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="owner@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500 hover:text-gray-700"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:bg-blue-400"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
