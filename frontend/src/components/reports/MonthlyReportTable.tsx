"use client";

import { MonthlyReport } from "@/services/reportService";

const fmt = (value: string | number) =>
  Number(value).toLocaleString("fa-IR");

// تبدیل ماه میلادی به نام ماه شمسی
const persianMonthLabel = (year: number, month: number) =>
  new Date(year, month - 1, 1).toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
  });

interface Props {
  report: MonthlyReport | null;
}

export default function MonthlyReportTable({ report }: Props) {
  if (report === null) {
    return <div className="card h-40 animate-pulse" />;
  }

  return (
    <div className="card overflow-x-auto">
      <h2 className="mb-4 text-lg font-bold text-primary-800">
        گزارش ماهانه (۱۲ ماه اخیر)
      </h2>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-gray-500">
            <th className="px-4 py-3 text-right font-medium">ماه</th>
            <th className="px-4 py-3 text-right font-medium">درآمد</th>
            <th className="px-4 py-3 text-right font-medium">هزینه</th>
            <th className="px-4 py-3 text-right font-medium">مانده</th>
            <th className="px-4 py-3 text-right font-medium">تعداد تراکنش</th>
          </tr>
        </thead>
        <tbody>
          {report.months.map((m) => (
            <tr key={m.label} className="border-b border-gray-50 hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-800">
                {persianMonthLabel(m.year, m.month)}
              </td>
              <td className="px-4 py-3 text-green-600">{fmt(m.income)}</td>
              <td className="px-4 py-3 text-red-600">{fmt(m.expense)}</td>
              <td
                className={`px-4 py-3 ${
                  Number(m.balance) >= 0 ? "text-blue-600" : "text-red-600"
                }`}
              >
                {fmt(m.balance)}
              </td>
              <td className="px-4 py-3 text-gray-500">
                {m.transaction_count.toLocaleString("fa-IR")}
              </td>
            </tr>
          ))}

          <tr className="bg-gray-50 font-bold">
            <td className="px-4 py-3">جمع کل</td>
            <td className="px-4 py-3 text-green-700">
              {fmt(report.total_income)}
            </td>
            <td className="px-4 py-3 text-red-700">
              {fmt(report.total_expense)}
            </td>
            <td className="px-4 py-3 text-blue-700">
              {fmt(report.total_balance)}
            </td>
            <td className="px-4 py-3">
              {report.total_transactions.toLocaleString("fa-IR")}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}