"use client";

import { useEffect, useState } from "react";

const API_GATEWAY_URL =
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ?? "http://127.0.0.1:3005";

type MonthData = { month: string; amount: number };

export default function MonthlyOverview() {
  const [monthlyData, setMonthlyData] = useState<MonthData[]>([]);

  useEffect(() => {
    fetchMonthlyData();
  }, []);

  const fetchMonthlyData = async () => {
    try {
      const savedUser = localStorage.getItem("devoteUser");
      const user = savedUser ? JSON.parse(savedUser) : null;
      if (!user?.id) return;

      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_GATEWAY_URL}/analytics/monthly/${user.id}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        },
      );
      const data = await response.json();
      if (data.monthlyData?.length) {
        setMonthlyData(data.monthlyData);
      }
    } catch (error) {
      console.error("Monthly overview error:", error);
    }
  };

  if (!monthlyData.length) {
    return <p style={{ color: "#9C7E5A", fontSize: 14 }}>No data available</p>;
  }

  const max = Math.max(...monthlyData.map((d) => d.amount), 1);
  const W = 560,
    H = 220,
    padL = 10,
    padR = 10,
    padT = 20,
    padB = 40;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const points = monthlyData.map((d, i) => ({
    x:
      monthlyData.length > 1
        ? padL + (i / (monthlyData.length - 1)) * chartW
        : padL + chartW / 2,
    y: padT + chartH - (d.amount / max) * chartH,
    month: d.month,
  }));

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
  const areaPath =
    `M ${points[0].x} ${padT + chartH} ` +
    points.map((p) => `L ${p.x} ${p.y}`).join(" ") +
    ` L ${points[points.length - 1].x} ${padT + chartH} Z`;
  const gridYs = [0.25, 0.5, 0.75].map((f) => padT + chartH - f * chartH);
  const lastMonth = points[points.length - 1]?.month;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C8773A" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#C8773A" stopOpacity="0" />
        </linearGradient>
      </defs>
      {gridYs.map((y, i) => (
        <line
          key={i}
          x1={padL}
          y1={y}
          x2={W - padR}
          y2={y}
          stroke="#E8DFD0"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
      ))}
      <path d={areaPath} fill="url(#areaGrad)" />
      <path
        d={linePath}
        fill="none"
        stroke="#C8773A"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="4"
          fill="white"
          stroke="#C8773A"
          strokeWidth="2.5"
        />
      ))}
      {points.map((p, i) => (
        <text
          key={i}
          x={p.x}
          y={H - 8}
          textAnchor="middle"
          fontSize="12"
          fill={p.month === lastMonth ? "#C8773A" : "#9C7E5A"}
          fontWeight={p.month === lastMonth ? "700" : "400"}
          fontFamily="'Segoe UI', sans-serif"
        >
          {p.month}
        </text>
      ))}
    </svg>
  );
}
