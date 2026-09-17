"use client";

import { ReactElement, useEffect, useState } from "react";
import MonthlyOverview from "@/components/features/dashboard/MonthlyOverview";
import TopTemples from "@/components/features/dashboard/TopTemples";
import SevaDistribution from "@/components/features/dashboard/SevaDistribution";
import { useLanguage } from "@/context/LanguageContext";
import AppShell from "@/components/layout/AppShell";

const API_GATEWAY_URL =
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ?? "http://127.0.0.1:3005";

const STAT_ICONS: Record<string, ReactElement> = {
  heart: (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#C8773A"
      strokeWidth="1.8"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  temple: (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#C8773A"
      strokeWidth="1.8"
    >
      <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v11M16 10v11M12 10v11" />
    </svg>
  ),
  flame: (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#C8773A"
      strokeWidth="1.8"
    >
      <path d="M12 2c0 0-4 4-4 8a4 4 0 0 0 8 0c0-4-4-8-4-8z" />
      <path d="M12 14v7M9 18h6" />
    </svg>
  ),
};

type AnalyticsData = {
  totalDonation: number;
  templesVisited: number;
  sevasDone: number;
};

export default function AnalyticsPage() {
  const { t } = useLanguage();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalDonation: 0,
    templesVisited: 0,
    sevasDone: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const savedUser = localStorage.getItem("devoteUser");
      const user = savedUser ? JSON.parse(savedUser) : null;

      if (!user?.id) {
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_GATEWAY_URL}/analytics/donations/${user.id}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        },
      );

      if (!response.ok) {
        setLoading(false);
        return;
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Analytics fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: t.totalDonated,
      value: loading ? "..." : `₹${analytics.totalDonation.toLocaleString()}`,
      icon: "heart",
    },
    {
      label: t.templesVisitedLabel,
      value: loading ? "..." : `${analytics.templesVisited}`,
      icon: "temple",
    },
    {
      label: t.sevasDoneLabel,
      value: loading ? "..." : `${analytics.sevasDone}`,
      icon: "flame",
    },
  ];

  return (
    <AppShell title={t.donationAnalytics}>
      <div
        className="min-h-screen bg-[#F5F0E8]"
        style={{ fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif" }}
      >
      <main className="px-8 py-6 space-y-5">
        <div className="grid grid-cols-3 gap-5">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-2xl px-7 py-6 flex items-center gap-5 shadow-sm"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#F5EFE6] flex items-center justify-center flex-shrink-0">
                {STAT_ICONS[card.icon]}
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#9C7E5A] tracking-[0.08em] uppercase mb-1">
                  {card.label}
                </p>
                <p className="text-[32px] font-bold text-[#1A0F00] leading-none tracking-tight">
                  {card.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[1fr_420px] gap-5">
          <div className="bg-white rounded-2xl px-7 py-6 shadow-sm">
            <h2 className="text-[17px] font-bold text-[#1A0F00] mb-6">
              {t.monthlyOverview}
            </h2>
            <MonthlyOverview />
          </div>

          <div className="flex flex-col gap-5">
            <div className="bg-white rounded-2xl px-7 py-6 shadow-sm">
              <h2 className="text-[17px] font-bold text-[#1A0F00] mb-5">
                {t.topTemples}
              </h2>
              <TopTemples />
            </div>
            <div className="bg-white rounded-2xl px-7 py-6 shadow-sm">
              <h2 className="text-[17px] font-bold text-[#1A0F00] mb-5">
                {t.sevaDistribution}
              </h2>
              <SevaDistribution />
            </div>
          </div>
        </div>
      </main>
      </div>
    </AppShell>
  );
}
