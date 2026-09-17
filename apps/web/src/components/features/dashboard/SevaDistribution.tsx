"use client";

import { useEffect, useState } from "react";

const API_GATEWAY_URL =
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ?? "http://127.0.0.1:3005";

type Seva = { name: string; percent: number; color: string };

export default function SevaDistribution() {
  const [sevas, setSevas] = useState<Seva[]>([]);

  useEffect(() => {
    fetchSevaDistribution();
  }, []);

  const fetchSevaDistribution = async () => {
    try {
      const savedUser = localStorage.getItem("devoteUser");
      const user = savedUser ? JSON.parse(savedUser) : null;
      if (!user?.id) return;

      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_GATEWAY_URL}/analytics/seva-distribution/${user.id}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        },
      );
      const data = await response.json();
      if (data.sevaDistribution?.length) {
        setSevas(data.sevaDistribution);
      }
    } catch (error) {
      console.error("Seva distribution error:", error);
    }
  };

  if (!sevas.length) {
    return <p style={{ color: "#9C7E5A", fontSize: 14 }}>No data available</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {sevas.map((seva) => (
        <div
          key={seva.name}
          className="flex items-center justify-between bg-[#FAF7F2] rounded-xl px-4 py-3.5 border border-[#EDE8DF]"
        >
          <div className="flex items-center gap-3">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: seva.color }}
            />
            <span className="text-[14px] font-medium text-[#1A0F00]">
              {seva.name}
            </span>
          </div>
          <span className="text-[14px] font-semibold text-[#5C4A2A]">
            {seva.percent}%
          </span>
        </div>
      ))}
    </div>
  );
}
