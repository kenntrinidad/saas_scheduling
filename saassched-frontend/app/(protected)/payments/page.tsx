// app/(protected)/payments/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { SummaryCards } from "./components/SummaryCards";
import { TransactionList } from "./components/TransactionList";
import { RecordPaymentModal } from "./components/RecordPaymentModal";
import { paymentsApi } from "./api";
import { transformPayment } from "./types";
import type { Payment, PaymentDTO, Client } from "./types";

export default function PaymentsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [paymentDTOs, setPaymentDTOs] = useState<PaymentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  function refresh() {
    setLoading(true);
    setLoadError(null);
    paymentsApi
      .list()
      .then(setPaymentDTOs)
      .catch(() => setLoadError("Couldn't load payments. Check your connection and try again."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    paymentsApi.listClients().then(setClients).catch(() => {
      /* client picker will just show empty until this succeeds */
    });
    refresh();
  }, []);

  const payments = useMemo(
    () => paymentDTOs.map((dto) => transformPayment(dto, clients)),
    [paymentDTOs, clients]
  );

  return (
    <div className="bg-[#FAFAF8]">
      <div className="max-w-3xl mx-auto">
        <header className="px-6 pt-6 pb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-[Manrope] text-2xl font-bold text-neutral-900">Payments</h1>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#1D5F55] hover:bg-[#164A42] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D5F55]"
          >
            + Record payment
          </button>
        </header>

        <div className="bg-white rounded-t-xl border border-neutral-200 mx-4">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-sm text-neutral-500">
              Loading payments…
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
            <>
              <SummaryCards payments={payments} />
              <h2 className="px-6 pt-5 pb-2 text-sm font-semibold text-neutral-700">Recent transactions</h2>
              <TransactionList payments={payments} />
            </>
          )}
        </div>
        <div className="h-8" />
      </div>

      <RecordPaymentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onRecorded={refresh}
        clients={clients}
      />
    </div>
  );
}
