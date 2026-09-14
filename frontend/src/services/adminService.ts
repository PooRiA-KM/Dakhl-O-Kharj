import { apiClient } from "./apiClient";

export interface AdminUser {
  id: number;
  full_name: string;
  email: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  transaction_count: number;
  total_income: string;
  total_expense: string;
  last_transaction_at: string | null;
}

export interface AdminStats {
  total_users: number;
  active_users: number;
  admin_users: number;
  new_users_this_month: number;
  total_transactions: number;
  total_income: string;
  total_expense: string;
  registrations: { year: number; month: number; label: string; count: number }[];
  recent_users: AdminUser[];
}

export interface AdminTransaction {
  id: number;
  title: string;
  amount: string;
  type: "income" | "expense";
  occurred_at: string;
  description: string | null;
  category_name: string | null;
  account_name: string | null;
  user: { id: number; full_name: string; email: string };
}

export function getAdminStats() {
  return apiClient.get<AdminStats>("/admin/stats");
}

export function getAdminUsers(
  params: { search?: string; skip?: number; limit?: number } = {}
) {
  const p = new URLSearchParams();
  if (params.search) p.set("search", params.search);
  p.set("skip", String(params.skip ?? 0));
  p.set("limit", String(params.limit ?? 50));
  return apiClient.get<{ items: AdminUser[]; total: number }>(
    `/admin/users?${p.toString()}`
  );
}

export function updateAdminUser(
  id: number,
  payload: { is_active?: boolean; is_admin?: boolean }
) {
  return apiClient.put<AdminUser>(`/admin/users/${id}`, payload);
}

export function deleteAdminUser(id: number) {
  return apiClient.delete<void>(`/admin/users/${id}`);
}

export function getAdminTransactions(
  params: { search?: string; type?: string; skip?: number; limit?: number } = {}
) {
  const p = new URLSearchParams();
  if (params.search) p.set("search", params.search);
  if (params.type) p.set("type", params.type);
  p.set("skip", String(params.skip ?? 0));
  p.set("limit", String(params.limit ?? 50));
  return apiClient.get<{ items: AdminTransaction[]; total: number }>(
    `/admin/transactions?${p.toString()}`
  );
}