"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import AuthGuard from "@/components/AuthGuard";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { AdminStats, getAdminStats } from "@/services/adminService";

const fmt = (v: string | number) => Number(v).toLocaleString("fa-IR");

export default function AdminOverviewPage() {
  const { user, loading: authLoading } = useAuth(true);
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    if (!user?.is_admin) return;
    getAdminStats().then((res) => {
      if (res.data) setStats(res.data);
    });
  }, [user]);

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

  const cards = stats
    ? [
        { label: "کل کاربران", value: fmt(stats.total_users), color: "text-blue-600" },
        { label: "کاربران فعال", value: fmt(stats.active_users), color: "text-green-600" },
        { label: "کاربران جدید این ماه", value: fmt(stats.new_users_this_month), color: "text-primary-600" },
        { label: "کل تراکنش‌ها", value: fmt(stats.total_transactions), color: "text-gray-700" },
        { label: "مجموع درآمدها", value: fmt(stats.total_income), color: "text-green-600" },
        { label: "مجموع هزینه‌ها", value: fmt(stats.total_expense), color: "text-red-600" },
      ]
    : [];

  return (
    <AuthGuard>
      <DashboardLayout>
        <h1 className="mb-6 text-xl font-bold text-primary-800">پنل مدیریت</h1>

        {!stats ? (
          <div className="card h-40 animate-pulse" />
        ) : (
          <>
            <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {cards.map((c) => (
                <div key={c.label} className="card p-4">
                  <div className="text-xs text-gray-500">{c.label}</div>
                  <div className={`mt-2 text-lg font-bold ${c.color}`}>
                    {c.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="card">
                <h2 className="mb-4 font-bold text-primary-800">
                  ثبت‌نام کاربران (۱۲ ماه اخیر)
                </h2>
                <div className="h-64" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.registrations}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="label" fontSize={11} />
                      <YAxis allowDecimals={false} fontSize={11} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card">
                <h2 className="mb-4 font-bold text-primary-800">
                  آخرین کاربران ثبت‌نام‌شده
                </h2>
                <div className="space-y-3">
                  {stats.recent_users.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3"
                    >
                      <div>
                        <div className="text-sm font-medium text-gray-800">
                          {u.full_name}
                        </div>
                        <div className="text-xs text-gray-500" dir="ltr">
                          {u.email}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(u.created_at).toLocaleDateString("fa-IR")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </DashboardLayout>
    </AuthGuard>
  );
}