"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/hooks/useAuth";
import { getSummary, getRecentTransactions, getMonthlyChart, getCategoryChart, Summary, RecentTransaction, MonthlyChart as MonthlyChartType, CategoryChart } from "@/services/dashboardService";
import SummaryCards from "@/components/dashboard/SummaryCards";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import MonthlyChart from "@/components/dashboard/MonthlyChart";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth(true);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[] | null>(null);
  const [monthlyChart, setMonthlyChart] = useState<MonthlyChartType | null>(null);
  const [categoryChart, setCategoryChart] = useState<CategoryChart | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [summaryRes, recentRes, monthlyRes, categoryRes] = await Promise.all([
        getSummary(),
        getRecentTransactions(5),
        getMonthlyChart(6),
        getCategoryChart(),
      ]);

      if (summaryRes.data) setSummary(summaryRes.data);
      if (recentRes.data) setRecentTransactions(recentRes.data);
      if (monthlyRes.data) setMonthlyChart(monthlyRes.data);
      if (categoryRes.data) setCategoryChart(categoryRes.data);

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
      <main className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-xl font-bold text-primary-800">داشبورد</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.full_name}</span>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-6">
          <SummaryCards summary={summary} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <MonthlyChart data={monthlyChart} />
            <RecentTransactions transactions={recentTransactions} />
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}