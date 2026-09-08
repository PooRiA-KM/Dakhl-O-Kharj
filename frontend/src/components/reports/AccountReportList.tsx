"use client";

import { AccountReport } from "@/services/reportService";

const typeLabels: Record<string, string> = {
  cash: "نقدی",
  bank: "بانکی",
  card: "کارت",
  wallet: "کیف پول",
};

const fmt = (value: string | number) =>
  Number(value).toLocaleString("fa-IR");

interface Props {
  report: AccountReport | null;
}

export default function AccountReportList({ report }: Props) {
  if (report === null) {
    return <div className="card h-40 animate-pulse" />;
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-bold text-primary-800">
        وضعیت حساب‌ها
      </h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {report.items.map((a) => (
          <div key={a.account_id} className="card">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-medium text-gray-800">
                {a.account_name}
              </span>
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">
                {typeLabels[a.account_type] ?? a.account_type}
              </span>
            </div>

            <div className="mb-3 text-xl font-bold text-primary-700">
              {fmt(a.current_balance)} تومان
            </div>

            <div className="flex justify-between text-xs text-gray-500">
              <span>
                درآمد:{" "}
                <span className="font-medium text-green-600">
                  {fmt(a.total_income)}
                </span>
              </span>
              <span>
                هزینه:{" "}
                <span className="font-medium text-red-600">
                  {fmt(a.total_expense)}
                </span>
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="card mt-4 border-primary-100 bg-primary-50">
        <div className="flex items-center justify-between">
          <span className="font-medium text-primary-800">
            مجموع موجودی همه حساب‌ها
          </span>
          <span className="text-xl font-bold text-primary-800">
            {fmt(report.total_balance)} تومان
          </span>
        </div>
      </div>
    </div>
  );
}