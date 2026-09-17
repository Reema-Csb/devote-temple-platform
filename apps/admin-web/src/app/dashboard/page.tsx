"use client";

import { useEffect, useState } from "react";
import {
  Banknote,
  Check,
  ChevronDown,
  Landmark,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  useGetTransactionsQuery,
  useGetTransactionOfferingMetadataQuery,
} from "@/store/api/paymentApi";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import AdminShell from "@/components/layout/AdminShell";
const TEMPLE_API_URL =
  process.env.NEXT_PUBLIC_TEMPLE_API_URL ?? "http://127.0.0.1:3001";
const AUTH_SERVICE_URL =
  process.env.NEXT_PUBLIC_AUTH_SERVICE_URL ?? "http://127.0.0.1:3006";

type Temple = {
  id: string;
  name: string;
  deleted?: boolean;
  isActive?: boolean;
};
type RegisteredUser = {
  id: string;
  role?: string;
  templeId?: string;
  createdOn?: string;
  deleted?: boolean;
};
type PaymentTransaction = {
  id: string;
  templeId?: string;
  templeName?: string;
  offeringId?: string;
  remarks?: string;
  transactionId?: string;
  paymentMethod?: string;
  paymentDate?: string;
  createdOn?: string;
  amount: number;
  status?: string;
  paymentStatus?: string;
  userId?: string;
};

export default function AdminDashboardPage() {
  const [temples, setTemples] = useState<Temple[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [selectedRange, setSelectedRange] = useState("week");
  const [isRangeDropdownOpen, setIsRangeDropdownOpen] = useState(false);
  const [adminRole, setAdminRole] = useState<string | null>(null);
  const [assignedTempleId, setAssignedTempleId] = useState<string | null>(null);
  const router = useRouter();
  const { data: paymentTransactions = [] } = useGetTransactionsQuery();
  const { data: offeringMetadata = [] } =
    useGetTransactionOfferingMetadataQuery();
  useEffect(() => {
    setAdminRole(sessionStorage.getItem("adminRole"));
    setAssignedTempleId(sessionStorage.getItem("templeId"));
    const fetchTemples = async () => {
      try {
        const response = await fetch(`${TEMPLE_API_URL}/temples`);

        if (!response.ok) {
          console.error("Temples API failed:", response.status);
          setTemples([]);
          return;
        }

        const data = await response.json();

        const activeTemples = Array.isArray(data)
          ? data.filter((temple) => !temple.deleted)
          : [];

        setTemples(activeTemples);
      } catch (error) {
        console.error("Failed to fetch temples:", error);
        setTemples([]);
      }
    };

    fetchTemples();

    const fetchUsers = async () => {
      try {
        const response = await fetch(`${AUTH_SERVICE_URL}/users`);

        if (!response.ok) {
          console.error("Users API failed:", response.status);
          setRegisteredUsers([]);
          return;
        }

        const data = await response.json();
        setRegisteredUsers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        setRegisteredUsers([]);
      }
    };

    fetchUsers();
  }, []);
  const isSuccessTransaction = (tx: PaymentTransaction) =>
    tx.status === "Success" || tx.paymentStatus === "success";
  const roleScopedTransactions = paymentTransactions.filter((tx) =>
    adminRole === "temple_admin" ? tx.templeId === assignedTempleId : true,
  );
  const successfulTransactions =
    roleScopedTransactions.filter(isSuccessTransaction);
  const now = new Date();

  const isDateInRange = (dateValue?: string) => {
    if (!dateValue) return false;

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return false;

    if (selectedRange === "week") {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);

      return date >= weekStart;
    }

    if (selectedRange === "month") {
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }

    if (selectedRange === "year") {
      return date.getFullYear() === now.getFullYear();
    }

    return true;
  };

  const isInSelectedRange = (tx: PaymentTransaction) =>
    isDateInRange(tx.paymentDate ?? tx.createdOn);

  const rangeTransactions = successfulTransactions.filter(isInSelectedRange);
  const allTransactionsInRange =
    roleScopedTransactions.filter(isInSelectedRange);
  const recentTransactions = [...allTransactionsInRange]
    .sort((a, b) => {
      const dateA = new Date(a.paymentDate ?? a.createdOn ?? 0).getTime();
      const dateB = new Date(b.paymentDate ?? b.createdOn ?? 0).getTime();
      return dateB - dateA;
    })
    .slice(0, 5);

  const totalTransactionAmount = rangeTransactions.reduce(
    (sum, tx) => sum + Number(tx.amount || 0),
    0,
  );

  const COMMISSION_FEE_PERCENT = 10;
  const GST_PERCENT = 10;
  const PAYMENT_GATEWAY_PERCENT = 5;

  const totalRevenue =
    totalTransactionAmount *
    ((COMMISSION_FEE_PERCENT + GST_PERCENT + PAYMENT_GATEWAY_PERCENT) / 100);

  const formatINR = (amount: number) =>
    `₹${amount.toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    })}`;

  const getStartOfWeek = () => {
    const date = new Date();
    const day = date.getDay();
    date.setDate(date.getDate() - day);
    date.setHours(0, 0, 0, 0);
    return date;
  };
  const activeDevotees =
    adminRole === "temple_admin"
      ? new Set(
          offeringMetadata
            .filter(
              (item) =>
                item.templeId === assignedTempleId &&
                isDateInRange(item.offeringDate),
            )
            .map((item) => item.userId)
            .filter(Boolean),
        ).size
      : registeredUsers.filter(
          (user) =>
            user.role === "user" &&
            !user.deleted &&
            isDateInRange(user.createdOn),
        ).length;
  const getFilteredTransactions = () => {
    return successfulTransactions.filter((tx) => {
      const date = new Date(tx.paymentDate || tx.createdOn || "");
      if (Number.isNaN(date.getTime())) return false;

      if (selectedRange === "week") {
        return date >= getStartOfWeek();
      }

      if (selectedRange === "month") {
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      }

      return date.getFullYear() === now.getFullYear();
    });
  };

  const filteredTransactions = getFilteredTransactions();

  const templeRevenueMap = new Map<string, number>();

  filteredTransactions.forEach((tx) => {
    if (!tx.templeId) return;

    templeRevenueMap.set(
      tx.templeId,
      (templeRevenueMap.get(tx.templeId) || 0) + Number(tx.amount || 0),
    );
  });

  const topTemples = temples
    .map((temple) => ({
      ...temple,
      donatedAmount: templeRevenueMap.get(temple.id) || 0,
    }))
    .filter((temple) => temple.donatedAmount > 0)
    .sort((a, b) => b.donatedAmount - a.donatedAmount)
    .slice(0, 4);
  const offeringAmountMap = new Map<string, number>();

  filteredTransactions.forEach((tx) => {
    const offeringName = tx.remarks || tx.paymentMethod || "Donation";

    offeringAmountMap.set(
      offeringName,
      (offeringAmountMap.get(offeringName) || 0) + Number(tx.amount || 0),
    );
  });

  const topPaidOfferings = Array.from(offeringAmountMap.entries())
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 4);
  const templeReceivableAmount = totalTransactionAmount * 0.75;

  const stats =
    adminRole === "temple_admin"
      ? [
          {
            title: "Total Transaction",
            value: String(allTransactionsInRange.length),
            change: "+12%",
            icon: Landmark,
          },
          {
            title: "Total Revenue",
            value: formatINR(templeReceivableAmount),
            change: "+8%",
            icon: Banknote,
          },
          {
            title: "Active Devotees",
            value: String(activeDevotees),
            change: "+5%",
            icon: Users,
          },
        ]
      : [
          {
            title: "Total Temples",
            value: String(temples.length),
            change: "+12%",
            icon: Landmark,
          },
          {
            title: "Total Transactions",
            value: String(allTransactionsInRange.length),
            change: "+8%",
            icon: Banknote,
          },
          {
            title: "Total Revenue",
            value: formatINR(totalRevenue),
            change: "+15%",
            icon: TrendingUp,
          },
          {
            title: "Active Devotees",
            value: String(activeDevotees),
            change: "+5%",
            icon: Users,
          },
        ];

  const weeklyRevenueData = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
  ].map((label, index) => {
    const revenue = successfulTransactions
      .filter((tx) => {
        const date = new Date(tx.paymentDate || tx.createdOn || "");
        return (
          !Number.isNaN(date.getTime()) &&
          date >= getStartOfWeek() &&
          date.getDay() === index
        );
      })
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

    return { label, revenue };
  });

  const monthlyRevenueData = ["Week 1", "Week 2", "Week 3", "Week 4"].map(
    (label, index) => {
      const revenue = successfulTransactions
        .filter((tx) => {
          const date = new Date(tx.paymentDate || tx.createdOn || "");
          if (Number.isNaN(date.getTime())) return false;

          const weekIndex = Math.min(Math.floor((date.getDate() - 1) / 7), 3);

          return (
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear() &&
            weekIndex === index
          );
        })
        .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

      return { label, revenue };
    },
  );

  const yearlyRevenueData = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ].map((label, index) => {
    const revenue = successfulTransactions
      .filter((tx) => {
        const date = new Date(tx.paymentDate || tx.createdOn || "");
        return (
          !Number.isNaN(date.getTime()) &&
          date.getFullYear() === now.getFullYear() &&
          date.getMonth() === index
        );
      })
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

    return { label, revenue };
  });
  const topTempleTitle =
    selectedRange === "week"
      ? "Top Temples This Week"
      : selectedRange === "month"
        ? "Top Temples This Month"
        : "Top Temples This Year";

  const revenueData =
    selectedRange === "week"
      ? weeklyRevenueData
      : selectedRange === "month"
        ? monthlyRevenueData
        : yearlyRevenueData;

  const rangeOptions = [
    { label: "This Week", value: "week" },
    { label: "This Month", value: "month" },
    { label: "This Year", value: "year" },
  ];

  const selectedRangeLabel =
    rangeOptions.find((option) => option.value === selectedRange)?.label ??
    "This Week";

  return (
    <AdminShell title="Dashboard">
      <main className="p-6">
        {/* TOP */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#3b2414]">
              Dashboard Overview
            </h1>
            <p className="text-sm text-[#8B7355]">
              Welcome back, Admin. Here's what's happening today.
            </p>
          </div>

          <div className="relative w-44">
            <button
              type="button"
              onClick={() => setIsRangeDropdownOpen((current) => !current)}
              className={`flex h-11 w-full items-center justify-between rounded-lg border bg-white px-4 text-left text-sm font-semibold text-[#3b2414] outline-none transition-all ${
                isRangeDropdownOpen
                  ? "border-[#c8602a] ring-4 ring-[#c8602a]/10"
                  : "border-[#e0c7a5] hover:border-[#c89554]"
              }`}
            >
              <span>{selectedRangeLabel}</span>

              <ChevronDown
                size={18}
                className={`text-[#8b6f47] transition-transform duration-200 ${
                  isRangeDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isRangeDropdownOpen && (
              <>
                <button
                  type="button"
                  aria-label="Close range dropdown"
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setIsRangeDropdownOpen(false)}
                />

                <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-full rounded-lg border border-[#e0c7a5] bg-white p-1.5 shadow-xl">
                  {rangeOptions.map((option) => {
                    const isSelected = selectedRange === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setSelectedRange(option.value);
                          setIsRangeDropdownOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm transition ${
                          isSelected
                            ? "bg-[#fff1e8] font-semibold text-[#c8602a]"
                            : "text-[#3b2414] hover:bg-[#f8f1e8]"
                        }`}
                      >
                        <span>{option.label}</span>

                        {isSelected && <Check size={17} />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* STATS */}
        <div className="mb-6 grid grid-cols-4 gap-6">
          {" "}
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="min-h-[150px] rounded-2xl border border-[#E5D5B5] bg-white p-6 shadow-sm"
              >
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f5eadc] text-[#C8602A]">
                    <Icon size={20} />
                  </div>

                  <span className="rounded-md bg-green-100 px-2 py-1 text-xs font-bold text-green-700">
                    {item.change}
                  </span>
                </div>

                <p className="text-xs font-bold uppercase tracking-wide text-[#8B7355]">
                  {item.title}
                </p>
                <h2 className="mt-1 text-3xl font-bold text-[#2D1F0E]">
                  {item.value}
                </h2>
              </div>
            );
          })}
        </div>

        {/* CHART + TOP TEMPLES */}
        <div className="mb-6 flex gap-6">
          {" "}
          {/* Revenue Trend */}
          <div
            className={`${
              adminRole === "temple_admin" ? "w-[68%]" : "w-[68%]"
            } rounded-2xl border border-[#E5D5B5] bg-white p-8 shadow-sm`}
          >
            {" "}
            <h2 className="mb-8 text-2xl font-bold text-black">
              Revenue Trend (
              {selectedRange === "week"
                ? "This Week"
                : selectedRange === "month"
                  ? "This Month"
                  : "This Year"}
              )
            </h2>
            <div className="h-[340px] w-full overflow-hidden">
              <BarChart width={850} height={320} data={revenueData}>
                <CartesianGrid stroke="#f0e5d8" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />{" "}
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar
                  dataKey="revenue"
                  fill="#C8602A"
                  radius={[10, 10, 0, 0]}
                  barSize={55}
                />
              </BarChart>
            </div>
          </div>
          {/* Top Temples */}
          {/* Top Temples / Top Paid Offerings */}
          <div className="w-[32%] rounded-2xl border border-[#E5D5B5] bg-white p-8 shadow-sm">
            <h2 className="mb-7 text-2xl font-bold text-black">
              {adminRole === "temple_admin"
                ? "Top Paid Offerings"
                : topTempleTitle}
            </h2>

            <div className="space-y-5">
              {adminRole === "temple_admin"
                ? topPaidOfferings.map((offering, index) => (
                    <div
                      key={offering.name}
                      className="flex items-center gap-4"
                    >
                      <div className="flex h-[50px] w-[50px] items-center justify-center rounded-xl bg-[#f5eadc] text-lg font-bold text-[#C8602A]">
                        {index + 1}
                      </div>

                      <div className="flex-1">
                        <h3 className="text-base font-bold text-black">
                          {offering.name}
                        </h3>
                        <p className="text-sm text-[#8B7355]">
                          Most paid offering
                        </p>
                      </div>

                      <p className="text-base font-bold text-[#C8602A]">
                        {formatINR(offering.amount)}
                      </p>
                    </div>
                  ))
                : topTemples.map((temple, index) => (
                    <div key={temple.id} className="flex items-center gap-4">
                      <div className="flex h-[50px] w-[50px] items-center justify-center rounded-xl bg-[#f5eadc] text-lg font-bold text-[#C8602A]">
                        {index + 1}
                      </div>

                      <div className="flex-1">
                        <h3 className="text-base font-bold text-black">
                          {temple.name}
                        </h3>
                        <p className="text-sm text-[#8B7355]">
                          {temple.isActive
                            ? "Active Temple"
                            : "Inactive Temple"}
                        </p>
                      </div>

                      <p className="text-base font-bold text-[#C8602A]">
                        {formatINR(temple.donatedAmount)}
                      </p>
                    </div>
                  ))}
            </div>

            {adminRole === "super_admin" && (
              <button
                onClick={() => router.push("/temple")}
                className="mt-8 w-full rounded-xl border border-[#C8602A] py-3 text-base font-bold text-[#C8602A] hover:bg-[#fff3ec]"
              >
                View All Temples
              </button>
            )}
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-2xl border border-[#E5D5B5] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#E5D5B5] px-6 py-5">
            <h2 className="text-lg font-bold text-[#3b2414]">
              Recent Transactions
            </h2>
            <button
              onClick={() => router.push("/transactions")}
              className="text-sm font-semibold text-[#C8602A]"
            >
              View All
            </button>
          </div>

          <table className="w-full text-left">
            <thead className="bg-[#f3eadf] text-xs uppercase tracking-wide text-[#8B7355]">
              <tr>
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Devotee</th>
                <th className="px-6 py-4">Temple & Offering</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>

            <tbody>
              {recentTransactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="border-t border-[#E5D5B5] text-sm text-[#3b2414]"
                >
                  <td className="px-6 py-4 text-[#8B7355]">
                    {tx.transactionId ?? tx.id}
                  </td>

                  <td className="px-6 py-4 font-semibold">Devotee</td>

                  <td className="px-6 py-4">
                    <p className="font-bold">
                      {tx.templeName ?? tx.templeId ?? "Unknown Temple"}
                    </p>
                    <p className="text-xs text-[#8B7355]">
                      {tx.remarks ?? tx.paymentMethod ?? "Donation"}
                    </p>
                  </td>

                  <td className="px-6 py-4 font-bold">
                    ₹{Number(tx.amount || 0).toLocaleString("en-IN")}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        tx.status === "Success"
                          ? "bg-green-100 text-green-700"
                          : tx.status === "Failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {tx.status ?? "Pending"}
                    </span>
                  </td>
                </tr>
              ))}

              {recentTransactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-[#8B7355]">
                    No recent transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </AdminShell>
  );
}
