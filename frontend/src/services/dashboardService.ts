import { apiClient } from "./apiClient";

export interface Summary {
  income_this_month: string;
  expense_this_month: string;
  balance_this_month: string;
  total_income: string;
  total_expense: string;
  total_balance: string;
  current_month_start: string;
  current_month_end: string;
  current_month_label: string;
}

export interface RecentTransaction {
  id: number;
  title: string;
  amount: string;
  type: "income" | "expense";
  occurred_at: string;
  occurred_at_persian: string | null;
  category: {
    id: number;
    name: string;
    type: string;
    color: string | null;
    icon: string | null;
  } | null;
  account: {
    id: number;
    name: string;
    type: string;
  } | null;
}

export interface MonthlyDataPoint {
  year: number;
  month: number;
  label: string;
  income: string;
  expense: string;
  balance: string;
}

export interface MonthlyChart {
  points: MonthlyDataPoint[];
}

export interface CategoryChartItem {
  category_id: number | null;
  category_name: string;
  color: string | null;
  amount: string;
  percentage: number;
  count: number;
}

export interface CategoryChart {
  month_label: string;
  total_expense: string;
  items: CategoryChartItem[];
}

export async function getSummary(): Promise<{ data?: Summary; error?: string }> {
  const response = await apiClient.get<Summary>("/dashboard/summary");
  if (response.error) return { error: response.error };
  return { data: response.data };
}

export async function getRecentTransactions(limit: number = 5): Promise<{ data?: RecentTransaction[]; error?: string }> {
  const response = await apiClient.get<{ items: RecentTransaction[] }>(`/dashboard/recent-transactions?limit=${limit}`);
  if (response.error) return { error: response.error };
  return { data: response.data?.items };
}

export async function getMonthlyChart(months: number = 12): Promise<{ data?: MonthlyChart; error?: string }> {
  const response = await apiClient.get<MonthlyChart>(`/dashboard/charts/monthly?months=${months}`);
  if (response.error) return { error: response.error };
  return { data: response.data };
}

export async function getCategoryChart(): Promise<{ data?: CategoryChart; error?: string }> {
  const response = await apiClient.get<CategoryChart>("/dashboard/charts/category");
  if (response.error) return { error: response.error };
  return { data: response.data };
}