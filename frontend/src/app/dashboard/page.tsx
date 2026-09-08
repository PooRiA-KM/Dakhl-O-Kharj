"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import {
  getSummary,
  getRecentTransactions,
  getMonthlyChart,
  Summary,
  RecentTransaction,
  MonthlyChart as MonthlyChartType,
} from "@/services/dashboardService";
import SummaryCards from "@/components/dashboard/SummaryCards";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import MonthlyChart from "@/components/dashboard/MonthlyChart";

export default function DashboardPage() {
  const { loading: authLoading } = useAuth(true);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [recentTransactions, setRecentTransactions] =
    useState<RecentTransaction[] | null>(null);
  const [monthlyChart, setMonthlyChart] =
    useState<MonthlyChartType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [summaryRes, recentRes, monthlyRes] = await Promise.all([
        getSummary(),
        getRecentTransactions(5),
        getMonthlyChart(6),
      ]);

      if (summaryRes.data) setSummary(summaryRes.data);
      if (recentRes.data) setRecentTransactions(recentRes.data);
      if (monthlyRes.data) setMonthlyChart(monthlyRes.data);

      setLoading(false);
    }

    fetchData();
  }, []);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-primary-800">داشبورد</h1>
          <Link href="/dashboard/transactions?new=1" className="btn-primary">
            + ثبت تراکنش
          </Link>
        </div>

        <SummaryCards summary={summary} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MonthlyChart data={monthlyChart} />
          <RecentTransactions transactions={recentTransactions} />
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}