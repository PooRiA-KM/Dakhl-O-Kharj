"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AccountReportList from "@/components/reports/AccountReportList";
import CategoryPieChart from "@/components/reports/CategoryPieChart";
import MonthlyReportTable from "@/components/reports/MonthlyReportTable";
import { useAuth } from "@/hooks/useAuth";
import {
  AccountReport,
  CategoryReport,
  getAccountReport,
  getCategoryReport,
  getMonthlyReport,
  MonthlyReport,
} from "@/services/reportService";

export default function ReportsPage() {
  const { loading: authLoading } = useAuth(true);
  const [monthly, setMonthly] = useState<MonthlyReport | null>(null);
  const [byCategory, setByCategory] = useState<CategoryReport | null>(null);
  const [byAccount, setByAccount] = useState<AccountReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [m, c, a] = await Promise.all([
        getMonthlyReport(12),
        getCategoryReport(),
        getAccountReport(),
      ]);

      if (m.data) setMonthly(m.data);
      if (c.data) setByCategory(c.data);
      if (a.data) setByAccount(a.data);

      setLoading(false);
    }

    fetchData();
  }, []);

  if (authLoading || loading) {
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

        <div className="space-y-6">
          <CategoryPieChart items={byCategory?.expense_items ?? []} />
          <MonthlyReportTable report={monthly} />
          <AccountReportList report={byAccount} />
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}