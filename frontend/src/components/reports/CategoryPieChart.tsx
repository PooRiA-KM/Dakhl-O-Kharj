"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { CategoryReportItem } from "@/services/reportService";

interface Props {
  items: CategoryReportItem[];
}

export default function CategoryPieChart({ items }: Props) {
  if (items.length === 0) {
    return (
      <div className="card py-10 text-center text-gray-500">
        در این ماه هزینه‌ای ثبت نشده است.
      </div>
    );
  }

  const data = items.map((i) => ({
    name: i.category_name,
    value: Number(i.amount),
    color: i.color ?? "#9ca3af",
  }));

  return (
    <div className="card">
      <h2 className="mb-4 text-lg font-bold text-primary-800">
        سهم دسته‌بندی‌ها از هزینه‌های این ماه
      </h2>

      <div className="h-72" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label={({ name, percent }: any) =>
                `${name} ${Math.round((percent ?? 0) * 100)}%`
              }
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any) =>
                `${Number(value).toLocaleString("fa-IR")} تومان`
              }
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}