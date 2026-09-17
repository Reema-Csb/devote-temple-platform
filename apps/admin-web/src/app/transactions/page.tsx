"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Download, Search, X } from "lucide-react";
import {
  useGetTransactionsQuery,
  useGetTransactionOfferingMetadataQuery,
} from "@/store/api/paymentApi";
import AdminShell from "@/components/layout/AdminShell";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useGetTemplesQuery } from "@/store/api/templeApi";

type Transaction = {
  id: string;
  createdOn?: string;
  date?: string;
  devoteeName?: string;
  devotee?: string;
  templeName?: string;
  temple?: string;
  offeringName?: string;
  offering?: string;
  amount: number | string;
  paymentMethod?: string;
  method?: string;
  status: string;
  templeId?: string;
};

function formatTxnDate(value?: string) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return `${date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}, ${date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "Success"
      ? "bg-green-100 text-green-600"
      : status === "Pending"
        ? "bg-orange-100 text-orange-500"
        : "bg-red-100 text-red-500";

  return (
    <span className={`rounded-full px-3 py-1 text-sm font-semibold ${styles}`}>
      {status}
    </span>
  );
}

type DropdownOption = {
  label: string;
  value: string;
};

type FilterDropdownProps = {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
};

function FilterDropdown({ value, options, onChange }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption =
    options.find((option) => option.value === value) ?? options[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={`flex h-12 w-full items-center justify-between rounded-lg border bg-[#f8f1e8] px-4 text-left text-sm font-medium text-[#2f1c0f] outline-none transition-all ${
          isOpen
            ? "border-[#c8602a] ring-4 ring-[#c8602a]/10"
            : "border-[#e2c99f] hover:border-[#c89554]"
        }`}
      >
        <span className="truncate">{selectedOption?.label}</span>

        <ChevronDown
          size={18}
          className={`shrink-0 text-[#8b6f47] transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            aria-label="Close dropdown"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute left-0 top-[calc(100%+8px)] z-50 max-h-64 w-full overflow-y-auto rounded-lg border border-[#e2c99f] bg-white p-1.5 shadow-xl">
            {options.map((option) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm transition ${
                    isSelected
                      ? "bg-[#fff1e8] font-semibold text-[#c8602a]"
                      : "text-[#2f1c0f] hover:bg-[#f8f1e8]"
                  }`}
                >
                  <span className="truncate">{option.label}</span>

                  {isSelected && <Check size={17} />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default function TransactionsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All Statuses");
  const [selectedFormat, setSelectedFormat] = useState("PDF");
  const [selectedTemple, setSelectedTemple] = useState("All Temples");
  const [dateFilter, setDateFilter] = useState("Last 30 Days");

  const [showReportModal, setShowReportModal] = useState(false);
  const [adminRole, setAdminRole] = useState<string | null>(null);
  const [templeId, setTempleId] = useState<string | null>(null);

  useEffect(() => {
    setAdminRole(sessionStorage.getItem("adminRole"));
    setTempleId(sessionStorage.getItem("templeId"));
  }, []);
  const {
    data: apiTransactions = [],
    isLoading,
    isError,
  } = useGetTransactionsQuery();

  const { data: temples = [] } = useGetTemplesQuery("");
  const { data: offeringMetadata = [] } =
    useGetTransactionOfferingMetadataQuery();
  const devoteeNameByTransactionId = new Map(
    offeringMetadata
      .filter((meta) => meta.paymentTransactionId)
      .map((meta) => [meta.paymentTransactionId, meta.devoteeName]),
  );
  const transactions: Transaction[] = apiTransactions.map((txn) => ({
    id: txn.id ?? txn.transactionId,
    templeId: txn.templeId,
    createdOn: txn.createdOn,
    date: txn.paymentDate,
    devoteeName: devoteeNameByTransactionId.get(txn.id) ?? "Devotee",
    templeName:
      temples.find((temple) => temple.id === txn.templeId)?.name ??
      txn.templeName ??
      txn.templeId ??
      "Unknown Temple",
    offeringName: txn.remarks ?? "Donation",
    amount: txn.amount,
    paymentMethod: txn.paymentMethod ?? "Razorpay",
    status: txn.status ?? "Pending",
  }));

  const templeOptions: DropdownOption[] = [
    {
      label: "All Temples",
      value: "All Temples",
    },
    ...temples.map((temple) => ({
      label: temple.name,
      value: temple.name,
    })),
  ];

  const statusOptions: DropdownOption[] = [
    {
      label: "All Statuses",
      value: "All Statuses",
    },
    ...Array.from(new Set(transactions.map((txn) => txn.status)))
      .filter(Boolean)
      .map((statusValue) => ({
        label: statusValue,
        value: statusValue,
      })),
  ];

  const dateOptions: DropdownOption[] = [
    {
      label: "Last 30 Days",
      value: "Last 30 Days",
    },
    {
      label: "Last 7 Days",
      value: "Last 7 Days",
    },
    {
      label: "This Month",
      value: "This Month",
    },
  ];

  const roleBasedTransactions =
    adminRole === "temple_admin"
      ? transactions.filter((txn) => txn.templeId === templeId)
      : transactions;
  const filteredTransactions = useMemo(() => {
    const today = new Date();

    return roleBasedTransactions
      .filter((txn) => {
        const searchValue = search.toLowerCase();

        const templeName = txn.templeName || txn.temple || "";
        const txnDateValue = txn.date || txn.createdOn;
        const txnDate = txnDateValue ? new Date(txnDateValue) : null;

        const matchesSearch =
          txn.id?.toLowerCase().includes(searchValue) ||
          txn.devoteeName?.toLowerCase().includes(searchValue) ||
          txn.devotee?.toLowerCase().includes(searchValue);

        const matchesStatus =
          status === "All Statuses" || txn.status === status;

        const matchesTemple =
          selectedTemple === "All Temples" || templeName === selectedTemple;

        let matchesDate = true;

        if (txnDate) {
          if (dateFilter === "Last 7 Days") {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(today.getDate() - 7);
            matchesDate = txnDate >= sevenDaysAgo;
          }

          if (dateFilter === "Last 30 Days") {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(today.getDate() - 30);
            matchesDate = txnDate >= thirtyDaysAgo;
          }

          if (dateFilter === "This Month") {
            matchesDate =
              txnDate.getMonth() === today.getMonth() &&
              txnDate.getFullYear() === today.getFullYear();
          }
        }

        return matchesSearch && matchesStatus && matchesTemple && matchesDate;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date ?? a.createdOn ?? 0).getTime();
        const dateB = new Date(b.date ?? b.createdOn ?? 0).getTime();
        return dateB - dateA;
      });
  }, [roleBasedTransactions, search, status, selectedTemple, dateFilter]);

  const handleExportPDF = () => {
    const doc = new jsPDF("portrait", "mm", "a4");
    doc.setFontSize(18);
    doc.text("Transactions Report", 14, 18);

    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 26);

    autoTable(doc, {
      startY: 34,

      head: [
        [
          "Order ID",
          "Temple Name",
          "Offering",
          "Amount",
          "Method",
          "Status",
          "Date",
        ],
      ],

      body: filteredTransactions.map((txn) => [
        txn.id ?? "-",
        txn.templeName ?? "-",
        txn.offeringName ?? "-",
        `Rs. ${Number(txn.amount).toLocaleString("en-IN")}`,
        txn.paymentMethod ?? "-",
        txn.status ?? "-",
        txn.date ? new Date(txn.date).toLocaleDateString("en-IN") : "-",
      ]),

      theme: "grid",

      styles: {
        fontSize: 8,
        cellPadding: 3,
        overflow: "linebreak",
        valign: "middle",
      },

      headStyles: {
        fillColor: [47, 28, 15],
        textColor: 255,
        fontStyle: "bold",
      },

      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 32 },
        2: { cellWidth: 36 },
        3: { cellWidth: 20, halign: "right" },
        4: { cellWidth: 18 },
        5: { cellWidth: 18 },
        6: { cellWidth: 20 },
      },

      margin: { left: 10, right: 10 },
    });

    doc.save(`transactions-${new Date().toISOString().split("T")[0]}.pdf`);
  };

  return (
    <AdminShell title="Transactios">
      <div className="min-h-screen bg-[#f5efe6] px-10 py-10">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black">Transactions</h1>
            <p className="mt-1 text-[#8B7355]">
              View and manage all devotee offerings.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-3 rounded-lg border border-[#E5D5B5] bg-white px-6 py-3 font-semibold shadow-sm hover:bg-[#faf7f2]"
            >
              <Download size={18} />
              Export
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#E5D5B5] bg-white">
          <div
            className={`grid gap-5 border-b border-[#E5D5B5] bg-[#fffaf2] p-5 ${
              adminRole === "temple_admin" ? "grid-cols-3" : "grid-cols-4"
            }`}
          >
            <div className="relative">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9b7b55]"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search TXN ID or Devotee..."
                className="h-12 w-full rounded-lg border border-[#E5D5B5] bg-[#f8f1e8] pl-12 text-sm outline-none"
              />
            </div>
            {adminRole !== "temple_admin" && (
              <FilterDropdown
                value={selectedTemple}
                options={templeOptions}
                onChange={setSelectedTemple}
              />
            )}
            <FilterDropdown
              value={status}
              options={statusOptions}
              onChange={setStatus}
            />
            <FilterDropdown
              value={dateFilter}
              options={dateOptions}
              onChange={setDateFilter}
            />
          </div>

          <table className="w-full">
            <thead className="bg-[#F7F0E6] text-left text-sm uppercase tracking-wide text-[#8B7355]">
              <tr>
                <th className="px-6 py-5">Transaction ID</th>
                <th className="px-6 py-5">Date</th>
                <th className="px-6 py-5">Devotee</th>
                <th className="px-6 py-5">Temple & Offering</th>
                <th className="px-6 py-5">Amount</th>
                <th className="px-6 py-5">Method</th>
                <th className="px-6 py-5">Status</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-10 text-center text-[#8B7355]"
                  >
                    Loading transactions...
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-10 text-center text-[#8B7355]"
                  >
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((txn) => (
                  <tr
                    key={txn.id}
                    className="border-t border-[#E5D5B5] transition hover:bg-[#fffaf2]"
                  >
                    <td className="px-6 py-6 text-[#8B7355]">{txn.id}</td>
                    <td className="px-6 py-6 text-[#8B7355]">
                      {formatTxnDate(txn.date || txn.createdOn)}
                    </td>
                    <td className="px-6 py-6 font-semibold">
                      {txn.devoteeName || txn.devotee || "-"}
                    </td>
                    <td className="px-6 py-6">
                      <p className="font-bold">
                        {txn.templeName || txn.temple || "-"}
                      </p>
                      <p className="text-sm text-[#8B7355]">
                        {txn.offeringName || txn.offering || "-"}
                      </p>
                    </td>
                    <td className="px-6 py-6 font-bold">₹{txn.amount}</td>
                    <td className="px-6 py-6 text-[#8B7355]">
                      {txn.paymentMethod || txn.method || "-"}
                    </td>
                    <td className="px-6 py-6">
                      <StatusBadge status={txn.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {adminRole === "super_admin" && showReportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-[620px] overflow-hidden rounded-2xl bg-white shadow-xl">
              <div className="flex items-start justify-between border-b border-[#E5D5B5] px-7 py-5">
                <div>
                  <h2 className="text-2xl font-semibold  text-[#2b2118]">
                    Send Report to Temple
                  </h2>
                  <p className="mt-2 text-sm text-[#8B7355]">
                    Email a transaction summary directly to the temple admin.
                  </p>
                </div>
                <button onClick={() => setShowReportModal(false)}>
                  <X className="text-[#8B7355]" />
                </button>
              </div>
              <div className="space-y-4 bg-white px-7 py-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#2b2118]">
                    Temple
                  </label>
                  <select className="h-12 w-full rounded-xl border border-[#E5D5B5] bg-[#f8f1e8] px-5 outline-none">
                    <option>Guruvayur Temple</option>
                    <option>Kashi Vishwanath</option>
                    <option>Tirupati Balaji</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#2b2118]">
                      From Date
                    </label>
                    <input
                      type="date"
                      className="h-12 w-full rounded-xl border border-[#E5D5B5] bg-[#f8f1e8] px-5 outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#2b2118]">
                      To Date
                    </label>
                    <input
                      type="date"
                      className="h-12 w-full rounded-xl border border-[#E5D5B5] bg-[#f8f1e8] px-5 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#2b2118]">
                    Format
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {["PDF", "Excel", "CSV"].map((format) => (
                      <button
                        key={format}
                        type="button"
                        onClick={() => setSelectedFormat(format)}
                        className={`h-12 rounded-xl border text-sm font-medium transition-all ${
                          selectedFormat === format
                            ? "border-[#d45f24] bg-[#fff4ed] text-[#d45f24]"
                            : "border-[#E5D5B5] bg-white text-[#8B7355]"
                        }`}
                      >
                        {format}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#2b2118]">
                    Recipient Email
                  </label>
                  <input
                    placeholder="admin@guruvayurtemple.org"
                    className="h-12 w-full rounded-xl border border-[#E5D5B5] bg-[#f8f1e8] px-5 outline-none"
                  />
                  <p className="mt-1 text-xs text-[#8B7355]">
                    {" "}
                    Separate multiple emails with commas
                  </p>
                </div>
                <label className="flex gap-4 rounded-xl border border-[#E5D5B5] bg-[#f8f1e8] p-5">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="mt-1 h-5 w-5"
                  />
                  <div>
                    <p className="text-sm font-medium text-[#2b2118]">
                      {" "}
                      Include payout summary
                    </p>
                    <p className="text-xs text-[#8B7355]">
                      Add settled and pending payout breakdown to the report
                    </p>
                  </div>
                </label>
              </div>
              <div className="flex justify-end gap-4 border-t border-[#E5D5B5] bg-[#f8f1e8] px-7 py-5">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="rounded-xl border border-[#E5D5B5] px-7 py-3 text-sm font-medium text-[#8B7355]"
                >
                  Cancel
                </button>
                <button className="rounded-xl bg-[#d45f24] px-8 py-3 text-sm font-medium text-white">
                  Send Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
