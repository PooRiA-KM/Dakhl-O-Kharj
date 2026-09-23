"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/services/apiClient";

interface MonthlyItem {
  year: number;
  month: number;
  label: string;
  income: string;
  expense: string;
  balance: string;
  transaction_count: number;
}

interface MonthlyReport {
  months: MonthlyItem[];
  total_income: string;
  total_expense: string;
  total_balance: string;
  total_transactions: number;
}

interface CategoryItem {
  category_id: number | null;
  category_name: string;
  type: string;
  color: string | null;
  amount: string;
  count: number;
  percentage: number;
}

interface CategoryReport {
  month_label: string;
  total_income: string;
  total_expense: string;
  income_items: CategoryItem[];
  expense_items: CategoryItem[];
}

interface AccountItem {
  account_id: number;
  account_name: string;
  account_type: string;
  initial_balance: string;
  current_balance: string;
  total_income: string;
  total_expense: string;
  transaction_count: number;
}

interface AccountReport {
  items: AccountItem[];
  total_balance: string;
}

const fmt = (v: string | number) => Number(v).toLocaleString("fa-IR");

const accountTypeLabel: Record<string, string> = {
  cash: "نقدی",
  bank: "بانکی",
  card: "کارت",
  wallet: "کیف پول",
};

function CategoryBars({
  items,
  color,
}: {
  items: CategoryItem[];
  color: string;
}) {
  if (items.length === 0) {
    return <div className="text-sm text-gray-400">موردی ثبت نشده است.</div>;
  }

  return (
    <div className="space-y-4">
      {items.map((c) => (
        <div key={c.category_id ?? `none-${c.category_name}`}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-gray-700">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: c.color ?? "#9ca3af" }}
              />
              {c.category_name}
            </span>
            <span className="text-gray-600">
              {fmt(c.amount)} ({fmt(c.percentage)}٪)
            </span>
          </div>
          <div className="h-2 rounded-full bg-gray-100">
            <div
              className={`h-2 rounded-full ${color}`}
              style={{ width: `${Math.min(c.percentage, 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ReportsPage() {
  const { loading: authLoading } = useAuth(true);
  const [monthly, setMonthly] = useState<MonthlyReport | null>(null);
  const [categories, setCategories] = useState<CategoryReport | null>(null);
  const [accounts, setAccounts] = useState<AccountReport | null>(null);

  useEffect(() => {
    Promise.all([
      apiClient.get<MonthlyReport>("/reports/monthly?months=12"),
      apiClient.get<CategoryReport>("/reports/by-category"),
      apiClient.get<AccountReport>("/reports/by-account"),
    ]).then(([m, c, a]) => {
      if (m.data) setMonthly(m.data);
      if (c.data) setCategories(c.data);
      if (a.data) setAccounts(a.data);
    });
  }, []);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <h1 className="mb-6 text-xl font-bold text-primary-800">گزارش‌ها</h1>

        {/* گزارش ماهانه */}
        <div className="card mb-6 overflow-x-auto">
          <h2 className="mb-4 font-bold text-primary-800">
            گزارش ماهانه (۱۲ ماه اخیر)
          </h2>

          {monthly === null ? (
            <div className="h-40 animate-pulse rounded-lg bg-gray-100" />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500">
                  <th className="px-4 py-3 text-right font-medium">ماه</th>
                  <th className="px-4 py-3 text-right font-medium">درآمد</th>
                  <th className="px-4 py-3 text-right font-medium">هزینه</th>
                  <th className="px-4 py-3 text-right font-medium">مانده</th>
                  <th className="px-4 py-3 text-right font-medium">
                    تعداد تراکنش
                  </th>
                </tr>
              </thead>
              <tbody>
                {monthly.months.map((m) => (
                  <tr
                    key={`${m.year}-${m.month}`}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-800">
                      {m.label}
                    </td>
                    <td className="px-4 py-3 text-green-600">
                      {fmt(m.income)}
                    </td>
                    <td className="px-4 py-3 text-red-600">{fmt(m.expense)}</td>
                    <td
                      className={`px-4 py-3 ${
                        Number(m.balance) >= 0
                          ? "text-blue-600"
                          : "text-red-600"
                      }`}
                    >
                      {fmt(m.balance)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {fmt(m.transaction_count)}
                    </td>
                  </tr>
                ))}

                <tr className="bg-gray-50 font-bold">
                  <td className="whitespace-nowrap px-4 py-3">جمع کل</td>
                  <td className="px-4 py-3 text-green-600">
                    {fmt(monthly.total_income)}
                  </td>
                  <td className="px-4 py-3 text-red-600">
                    {fmt(monthly.total_expense)}
                  </td>
                  <td className="px-4 py-3 text-blue-600">
                    {fmt(monthly.total_balance)}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {fmt(monthly.total_transactions)}
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>

        {/* گزارش دسته‌بندی ماه جاری */}
        {categories && (
          <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="card">
              <h2 className="mb-4 font-bold text-primary-800">
                درآمدهای {categories.month_label}
              </h2>
              <CategoryBars items={categories.income_items} color="bg-green-500" />
            </div>
            <div className="card">
              <h2 className="mb-4 font-bold text-primary-800">
                هزینه‌های {categories.month_label}
              </h2>
              <CategoryBars items={categories.expense_items} color="bg-red-500" />
            </div>
          </div>
        )}

        {/* وضعیت حساب‌ها */}
        <h2 className="mb-4 text-lg font-bold text-primary-800">
          وضعیت حساب‌ها
        </h2>

        {accounts === null ? (
          <div className="h-32 animate-pulse rounded-2xl bg-gray-100" />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {accounts.items.map((a) => (
                <div key={a.account_id} className="card">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-800">
                      {a.account_name}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                      {accountTypeLabel[a.account_type] ?? a.account_type}
                    </span>
                  </div>

                  <div className="mt-3 text-lg font-bold text-primary-700">
                    {fmt(a.current_balance)} تومان
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <span>
                      درآمد:{" "}
                      <span className="text-green-600">
                        {fmt(a.total_income)}
                      </span>
                    </span>
                    <span>
                      هزینه:{" "}
                      <span className="text-red-600">
                        {fmt(a.total_expense)}
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="card mt-4 flex items-center justify-between">
              <span className="font-bold text-gray-700">
                مجموع موجودی همه حساب‌ها
              </span>
              <span className="text-lg font-bold text-primary-700">
                {fmt(accounts.total_balance)} تومان
              </span>
            </div>
          </>
        )}
      </DashboardLayout>
    </AuthGuard>
  );
}