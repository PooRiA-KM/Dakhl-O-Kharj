import { apiClient } from "./apiClient";

export type TransactionType = "income" | "expense";

export interface TransactionCategory {
  id: number;
  name: string;
  type: string;
  color: string | null;
  icon: string | null;
}

export interface TransactionAccount {
  id: number;
  name: string;
  type: string;
}

export interface Transaction {
  id: number;
  user_id: number;
  title: string;
  amount: string;
  type: TransactionType;
  category_id: number | null;
  account_id: number | null;
  occurred_at: string;
  occurred_at_persian?: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  category: TransactionCategory | null;
  account: TransactionAccount | null;
}

export interface TransactionPayload {
  title: string;
  amount: number;
  type: TransactionType;
  category_id?: number | null;
  account_id?: number | null;
  occurred_at?: string | null;
  description?: string | null;
}

export interface TransactionFilters {
  type?: TransactionType;
  category_id?: number;
  account_id?: number;
  search?: string;
  skip?: number;
  limit?: number;
}

export async function getTransactions(filters: TransactionFilters = {}) {
  const params = new URLSearchParams();

  if (filters.type) params.set("type", filters.type);
  if (filters.category_id) params.set("category_id", String(filters.category_id));
  if (filters.account_id) params.set("account_id", String(filters.account_id));
  if (filters.search) params.set("search", filters.search);

  params.set("skip", String(filters.skip ?? 0));
  params.set("limit", String(filters.limit ?? 100));

  return apiClient.get<Transaction[]>(`/transactions?${params.toString()}`);
}

export async function createTransaction(payload: TransactionPayload) {
  return apiClient.post<Transaction>("/transactions", payload);
}

export async function updateTransaction(
  id: number,
  payload: Partial<TransactionPayload>
) {
  return apiClient.put<Transaction>(`/transactions/${id}`, payload);
}

export async function deleteTransaction(id: number) {
  return apiClient.delete<void>(`/transactions/${id}`);
}