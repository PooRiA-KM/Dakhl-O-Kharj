"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import {
  AdminTransaction,
  getAdminTransactions,
} from "@/services/adminService";

const fmt = (v: string | number) => Number(v).toLocaleString("fa-IR");

export default function AdminTransactionsPage() {
  const { user, loading: authLoading } = useAuth(true);
  const [items, setItems] = useState<AdminTransaction[] | null>(null);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");

  const fetchData = async () => {
    const res = await getAdminTransactions({
      search: search || undefined,
      type: type || undefined,
      limit: 100,
    });
    if (res.data) setItems(res.data.items);
  };

  useEffect(() => {
    if (user?.is_admin) fetchData();
  }, [user, type]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (user?.is_admin) fetchData();
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user?.is_admin) {
    return (
      <DashboardLayout>
        <div className="card py-12 text-center text-gray-500">
          دسترسی مدیر لازم است.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-xl font-bold text-primary-800">
            تراکنش‌های همه کاربران
          </h1>
          <div className="flex gap-2">
            <input
              className="input max-w-xs"
              placeholder="جستجو: عنوان، نام یا ایمیل..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="input w-32"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">همه</option>
              <option value="income">درآمد</option>
              <option value="expense">هزینه</option>
            </select>
          </div>
        </div>

        {items === null ? (
          <div className="card h-40 animate-pulse" />
        ) : items.length === 0 ? (
          <div className="card py-10 text-center text-gray-500">
            تراکنشی یافت نشد.
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500">
                  <th className="px-4 py-3 text-right font-medium">تاریخ</th>
                  <th className="px-4 py-3 text-right font-medium">کاربر</th>
                  <th className="px-4 py-3 text-right font-medium">عنوان</th>
                  <th className="px-4 py-3 text-right font-medium">دسته / حساب</th>
                  <th className="px-4 py-3 text-right font-medium">مبلغ</th>
                </tr>
              </thead>
              <tbody>
                {items.map((t) => (
                  <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                      {new Date(t.occurred_at).toLocaleDateString("fa-IR")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">
                        {t.user.full_name}
                      </div>
                      <div className="text-xs text-gray-500" dir="ltr">
                        {t.user.email}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-800">{t.title}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {t.category_name ?? "—"} / {t.account_name ?? "—"}
                    </td>
                    <td
                      className={`whitespace-nowrap px-4 py-3 font-medium ${
                        t.type === "income" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {t.type === "income" ? "+" : "−"} {fmt(t.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardLayout>
    </AuthGuard>
  );
}