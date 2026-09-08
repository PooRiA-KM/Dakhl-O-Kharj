import { apiClient } from "./apiClient";

export interface MonthlyReportItem {
  year: number;
  month: number;
  label: string;
  income: string;
  expense: string;
  balance: string;
  transaction_count: number;
}

export interface MonthlyReport {
  months: MonthlyReportItem[];
  total_income: string;
  total_expense: string;
  total_balance: string;
  total_transactions: number;
}

export interface CategoryReportItem {
  category_id: number | null;
  category_name: string;
  type: string;
  color: string | null;
  amount: string;
  count: number;
  percentage: number;
}

export interface CategoryReport {
  month_label: string;
  total_income: string;
  total_expense: string;
  income_items: CategoryReportItem[];
  expense_items: CategoryReportItem[];
}

export interface AccountReportItem {
  account_id: number;
  account_name: string;
  account_type: string;
  initial_balance: string;
  current_balance: string;
  total_income: string;
  total_expense: string;
  transaction_count: number;
}

export interface AccountReport {
  items: AccountReportItem[];
  total_balance: string;
}

export async function getMonthlyReport(months: number = 12) {
  return apiClient.get<MonthlyReport>(`/reports/monthly?months=${months}`);
}

export async function getCategoryReport() {
  return apiClient.get<CategoryReport>("/reports/by-category");
}

export async function getAccountReport() {
  return apiClient.get<AccountReport>("/reports/by-account");
}