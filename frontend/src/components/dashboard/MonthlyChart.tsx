"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { MonthlyChart as MonthlyChartType } from "@/services/dashboardService";

export default function MonthlyChart({ data }: { data: MonthlyChartType | null }) {
  if (!data) {
    return (
      <div className="card animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-32 mb-4"></div>
        <div className="h-64 bg-gray-100 rounded"></div>
      </div>
    );
  }

  const chartData = data.points.map((p) => ({
    name: p.label,
    درآمد: parseFloat(p.income),
    هزینه: parseFloat(p.expense),
  }));

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">درآمد و هزینه ماهانه</h3>
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value: number) => value.toLocaleString("fa-IR")} />
            <Legend />
            <Bar dataKey="درآمد" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="هزینه" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}