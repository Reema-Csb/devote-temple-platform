"use client";

import { useState } from "react";
import { TransactionStatus, Transaction } from "@/types/transaction.type";
import {
  useGetTransactionsQuery,
  PaymentTransaction,
} from "@/store/api/paymentApi";
import TransactionDetails from "@/components/features/dashboard/TransactionDetails";
import { TRANSACTION_COLUMNS, TRANSACTION_TABS } from "@/constants/mock.data";
import { useLanguage } from "@/context/LanguageContext";
import AppShell from "@/components/layout/AppShell";

type FilterTab = "All Transactions" | TransactionStatus;

function mapApiToTransaction(tx: PaymentTransaction): Transaction {
  const date = tx.paymentDate
    ? new Date(tx.paymentDate)
    : new Date(tx.createdOn ?? Date.now());

  return {
    id: tx.id,
    templeName: tx.templeName ?? tx.templeId ?? "Unknown Temple",
    sevaName: tx.remarks ?? tx.paymentMethod ?? "Seva",
    templeIcon: "🛕",
    transactionId: tx.transactionId ?? tx.id,
    date: date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }),
    time: date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
    amount: tx.amount,
    status: normalizeStatus(tx.status),
  };
}

function normalizeStatus(raw?: string): TransactionStatus {
  switch (raw?.toLowerCase()) {
    case "success":
    case "completed":
    case "paid":
      return "Completed";
    case "failed":
    case "failure":
      return "Failed";
    default:
      return "Pending";
  }
}

export default function TransactionsPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<FilterTab>("All Transactions");
  const [search, setSearch] = useState("");

  const { data = [], isLoading, isError: error } = useGetTransactionsQuery();
  const transactions = [...data]
    .sort((a, b) => {
      const dateA = new Date(a.paymentDate ?? a.createdOn ?? 0).getTime();
      const dateB = new Date(b.paymentDate ?? b.createdOn ?? 0).getTime();
      return dateB - dateA;
    })
    .map(mapApiToTransaction);

  // ── Filter transactions ──
  const filtered = transactions.filter((tx) => {
    const matchesTab =
      activeTab === "All Transactions" || tx.status === activeTab;
    const q = search.toLowerCase();
    const matchesSearch =
      tx.templeName.toLowerCase().includes(q) ||
      tx.transactionId.toLowerCase().includes(q) ||
      tx.sevaName.toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  const TAB_LABELS: Record<string, string> = {
    "All Transactions": t.allTransactions,
    Completed: t.completedStatus,
    Pending: t.pendingStatus,
    Failed: t.failedStatus,
  };

  const COL_LABELS: Record<string, string> = {
    "TEMPLE & SEVA": t.colTempleAndSeva,
    "TRANSACTION ID": t.colTransactionId,
    "DATE & TIME": t.colDateAndTime,
    AMOUNT: t.colAmount,
    STATUS: t.colStatus,
    ACTION: t.colAction,
  };

  return (
    <AppShell title={t.transactionHistory}>
      <div
        className="min-h-screen bg-[#F5F0E8]"
        style={{ fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif" }}
      >
      {/* ── Main Content ── */}
      <main className="px-8 py-6">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* ── Filter Tabs + Search ── */}
          <div className="flex items-center justify-between px-6 pt-6 pb-5">
            <div className="flex items-center gap-2">
              {TRANSACTION_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as FilterTab)}
                  className={`px-5 py-2 rounded-full text-[14px] font-semibold transition-all duration-200 ${
                    activeTab === tab
                      ? "bg-[#1A0F00] text-white shadow-sm"
                      : "bg-white text-[#5C4A2A] border border-[#D4C4A8] hover:border-[#9C7E5A] hover:bg-[#FAF7F2]"
                  }`}
                >
                  {TAB_LABELS[tab] ?? tab}
                </button>
              ))}
            </div>

            <div className="relative">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B0967A]"
                width="15"
                height="15"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder={t.searchTransactionsPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64 pl-10 pr-4 py-2.5 rounded-full border border-[#D4C4A8] text-[14px] text-[#1A0F00] placeholder-[#B0967A] bg-[#FAF7F2] focus:outline-none focus:border-[#9B4B1A] focus:ring-1 focus:ring-[#9B4B1A] transition-colors"
              />
            </div>
          </div>

          {/* ── Table ── */}
          <table className="w-full">
            <thead>
              <tr className="border-t border-b border-[#EDE8DF]">
                {TRANSACTION_COLUMNS.map(({ label, w }) => (
                  <th
                    key={label}
                    className={`${w} px-6 py-3.5 text-left text-[11px] font-bold text-[#9C7E5A] tracking-[0.08em] uppercase`}
                  >
                    {COL_LABELS[label] ?? label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Loading state */}
              {isLoading && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-16 text-[#9C7E5A] text-sm"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#C8773A] border-t-transparent rounded-full animate-spin" />
                      {t.loadingTransactions}
                    </div>
                  </td>
                </tr>
              )}

              {/* Error state */}
              {!isLoading && error && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-16 text-[#E53935] text-sm"
                  >
                    {t.failedToLoadTx}
                  </td>
                </tr>
              )}

              {/* Data */}
              {!isLoading && !error && filtered.length > 0 && (
                <TransactionDetails transactions={filtered} />
              )}

              {/* Empty state */}
              {!isLoading && !error && filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-16 text-[#9C7E5A] text-sm"
                  >
                    {t.noTransactionsFound}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
      </div>
    </AppShell>
  );
}
