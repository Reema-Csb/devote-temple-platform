"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useGetPayoutsQuery } from "@/store/api/paymentApi";
import { useGetTemplesQuery } from "@/store/api/templeApi";
import AdminShell from "@/components/layout/AdminShell";

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "paid"
      ? "bg-green-100 text-green-600"
      : "bg-orange-100 text-orange-500";

  return (
    <span
      className={`rounded-full px-3 py-1 text-sm font-semibold capitalize ${styles}`}
    >
      {status}
    </span>
  );
}

export default function PayoutsPage() {
  const searchParams = useSearchParams();
  const templeIdParam = searchParams.get("templeId");

  const [search, setSearch] = useState("");
  const [selectedTemple, setSelectedTemple] = useState("All Temples");
  const [status, setStatus] = useState("All Statuses");
  const [adminRole, setAdminRole] = useState<string | null>(null);
  const [templeId, setTempleId] = useState<string | null>(null);

  useEffect(() => {
    setAdminRole(sessionStorage.getItem("adminRole"));
    setTempleId(sessionStorage.getItem("templeId"));
  }, []);

  const isTempleAdmin = adminRole === "temple_admin";

  const { data: payouts = [], isLoading } = useGetPayoutsQuery();
  const { data: temples = [] } = useGetTemplesQuery("");

  useEffect(() => {
    if (!templeIdParam || temples.length === 0) return;
    const temple = temples.find((t) => t.id === templeIdParam);
    if (temple) setSelectedTemple(temple.name);
  }, [templeIdParam, temples]);

  const rows = useMemo(
    () =>
      payouts
        .map((payout) => ({
          ...payout,
          templeName:
            temples.find((temple) => temple.id === payout.templeId)?.name ??
            payout.templeId,
        }))
        .filter((payout) => !isTempleAdmin || payout.templeId === templeId)
        .sort((a, b) => {
          const dateA = new Date(a.paidOn || "").getTime();
          const dateB = new Date(b.paidOn || "").getTime();
          return dateB - dateA;
        }),
    [payouts, temples, isTempleAdmin, templeId],
  );

  const filteredRows = useMemo(() => {
    const searchValue = search.toLowerCase();

    return rows.filter((row) => {
      const matchesSearch =
        !searchValue ||
        row.templeName?.toLowerCase().includes(searchValue) ||
        row.id?.toLowerCase().includes(searchValue);

      const matchesTemple =
        selectedTemple === "All Temples" || row.templeName === selectedTemple;

      const matchesStatus =
        status === "All Statuses" ||
        (row.payoutStatus ?? "pending") === status;

      return matchesSearch && matchesTemple && matchesStatus;
    });
  }, [rows, search, selectedTemple, status]);

  const totalPaidOut = rows
    .filter((row) => row.payoutStatus === "paid")
    .reduce((sum, row) => sum + Number(row.payoutAmount || 0), 0);

  const totalPending = rows
    .filter((row) => (row.payoutStatus ?? "pending") !== "paid")
    .reduce((sum, row) => sum + Number(row.payoutAmount || 0), 0);

  return (
    <AdminShell title="Payouts">
      <div className="min-h-screen bg-[#f5efe6] px-10 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black">Payouts</h1>
          <p className="mt-1 text-[#8B7355]">
            {isTempleAdmin
              ? "Payouts received from the Devote admin."
              : "All payouts sent from Devote to temple admins."}
          </p>
        </div>

        <div className="mb-8 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-[#E5D5B5] bg-white p-6">
            <p className="text-sm text-[#8B7355]">Total Paid Out</p>
            <p className="mt-2 text-2xl font-bold text-green-600">
              ₹{totalPaidOut.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="rounded-2xl border border-[#E5D5B5] bg-white p-6">
            <p className="text-sm text-[#8B7355]">Pending Payouts</p>
            <p className="mt-2 text-2xl font-bold text-orange-500">
              ₹{totalPending.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#E5D5B5] bg-white">
          <div
            className={`grid gap-5 border-b border-[#E5D5B5] bg-[#fffaf2] p-5 ${
              isTempleAdmin ? "md:grid-cols-2" : "md:grid-cols-3"
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
                placeholder={
                  isTempleAdmin ? "Search Payout ID..." : "Search Payout ID or Temple..."
                }
                className="h-12 w-full rounded-lg border border-[#E5D5B5] bg-[#f8f1e8] pl-12 text-sm outline-none"
              />
            </div>

            {!isTempleAdmin && (
              <select
                value={selectedTemple}
                onChange={(e) => setSelectedTemple(e.target.value)}
                className="h-12 rounded-lg border border-[#E5D5B5] bg-[#f8f1e8] px-5 outline-none"
              >
                <option>All Temples</option>
                {temples.map((temple) => (
                  <option key={temple.id} value={temple.name}>
                    {temple.name}
                  </option>
                ))}
              </select>
            )}

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-12 rounded-lg border border-[#E5D5B5] bg-[#f8f1e8] px-5 outline-none"
            >
              <option value="All Statuses">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <table className="w-full">
            <thead className="bg-[#F7F0E6] text-left text-sm uppercase tracking-wide text-[#8B7355]">
              {isTempleAdmin ? (
                <tr>
                  <th className="px-6 py-5">No. of Transactions</th>
                  <th className="px-6 py-5">Total Collected</th>
                  <th className="px-6 py-5">Commission</th>
                  <th className="px-6 py-5">Amount Credited</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5">Date</th>
                </tr>
              ) : (
                <tr>
                  <th className="px-6 py-5">Temple</th>
                  <th className="px-6 py-5">Transactions</th>
                  <th className="px-6 py-5">Total Collected</th>
                  <th className="px-6 py-5">Commission</th>
                  <th className="px-6 py-5">Payout Amount</th>
                  <th className="px-6 py-5">Method</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5">Paid On</th>
                </tr>
              )}
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={isTempleAdmin ? 6 : 8}
                    className="px-6 py-10 text-center text-[#8B7355]"
                  >
                    Loading payouts...
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={isTempleAdmin ? 6 : 8}
                    className="px-6 py-10 text-center text-[#8B7355]"
                  >
                    No payouts found.
                  </td>
                </tr>
              ) : isTempleAdmin ? (
                filteredRows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-[#E5D5B5] transition hover:bg-[#fffaf2]"
                  >
                    <td className="px-6 py-6 text-[#8B7355]">
                      {row.transactionCount}
                    </td>
                    <td className="px-6 py-6 text-[#8B7355]">
                      ₹{Number(row.totalCollected || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-6 text-[#8B7355]">
                      ₹
                      {Number(
                        row.platformCommissionAmount ?? row.commissionAmount ?? 0,
                      ).toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-6 font-bold">
                      ₹{Number(row.payoutAmount || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-6">
                      <StatusBadge status={row.payoutStatus ?? "pending"} />
                    </td>
                    <td className="px-6 py-6 text-[#8B7355]">
                      {row.paidOn
                        ? new Date(row.paidOn).toLocaleDateString("en-IN")
                        : "-"}
                    </td>
                  </tr>
                ))
              ) : (
                filteredRows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-[#E5D5B5] transition hover:bg-[#fffaf2]"
                  >
                    <td className="px-6 py-6 font-bold">{row.templeName}</td>
                    <td className="px-6 py-6 text-[#8B7355]">
                      {row.transactionCount}
                    </td>
                    <td className="px-6 py-6 text-[#8B7355]">
                      ₹{Number(row.totalCollected || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-6 text-[#8B7355]">
                      ₹
                      {Number(
                        row.platformCommissionAmount ?? row.commissionAmount ?? 0,
                      ).toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-6 font-bold">
                      ₹{Number(row.payoutAmount || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-6 text-[#8B7355] capitalize">
                      {row.payoutMethod || "manual"}
                    </td>
                    <td className="px-6 py-6">
                      <StatusBadge status={row.payoutStatus ?? "pending"} />
                    </td>
                    <td className="px-6 py-6 text-[#8B7355]">
                      {row.paidOn
                        ? new Date(row.paidOn).toLocaleDateString("en-IN")
                        : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
