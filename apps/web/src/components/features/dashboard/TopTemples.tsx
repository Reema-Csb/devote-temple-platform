"use client";

import { useEffect, useState } from "react";

const API_GATEWAY_URL =
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ?? "http://127.0.0.1:3005";

type Temple = { name: string; percent: number; color: string };

export default function TopTemples() {
  const [temples, setTemples] = useState<Temple[]>([]);

  useEffect(() => {
    fetchTopTemples();
  }, []);

  const fetchTopTemples = async () => {
    try {
      const savedUser = localStorage.getItem("devoteUser");
      const user = savedUser ? JSON.parse(savedUser) : null;
      if (!user?.id) return;

      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_GATEWAY_URL}/analytics/top-temples/${user.id}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        },
      );
      const data = await response.json();
      if (data.topTemples?.length) {
        setTemples(data.topTemples);
      }
    } catch (error) {
      console.error("Top temples error:", error);
    }
  };

  if (!temples.length) {
    return <p style={{ color: "#9C7E5A", fontSize: 14 }}>No data available</p>;
  }

  return (
    <div className="space-y-5">
      {temples.map((temple) => (
        <div key={temple.name}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[14px] font-medium text-[#1A0F00]">
              {temple.name}
            </span>
            <span className="text-[14px] font-semibold text-[#1A0F00]">
              {temple.percent}%
            </span>
          </div>
          <div className="w-full h-[10px] rounded-full bg-[#F0E9DC] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${temple.percent}%`,
                background: `linear-gradient(90deg, ${temple.color} 0%, #E8945A 100%)`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
