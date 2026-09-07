import { apiClient } from "./apiClient";

export interface Transaction {
  id: number;
  title: string;
  amount: string;
  type: "income" | "expense";
  category_id: number | null;
  account_id: number | null;
  occurred_at: string;
  description: string | null;
  created_at: string;
  updated_at: string;
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

export interface TransactionCreate {
  title: string;
  amount: number;
  type: "income" | "expense";
  category_id?: number | null;
  account_id?: number | null;
  occurred_at?: string;
  description?: string;
}

export async function getTransactions(params?: {
  type?: string;
  category_id?: number;
  account_id?: number;
  search?: string;
  skip?: number;
  limit?: number;
}): Promise<{ data?: Transaction[]; error?: string }> {
  const query = new URLSearchParams();

  if (params?.type) query.append("type", params.type);
  if (params?.category_id) query.append("category_id", String(params.category_id));
  if (params?.account_id) query.append("account_id", String(params.account_id));
  if (params?.search) query.append("search", params.search);
  if (params?.skip !== undefined) query.append("skip", String(params.skip));
  if (params?.limit !== undefined) query.append("limit", String(params.limit));

  const response = await apiClient.get<Transaction[]>(`/transactions?${query.toString()}`);

  if (response.error) return { error: response.error };
  return { data: response.data };
}

export async function createTransaction(data: TransactionCreate): Promise<{ data?: Transaction; error?: string }> {
  const response = await apiClient.post<Transaction>("/transactions", data);

  if (response.error) return { error: response.error };
  return { data: response.data };
}

export async function updateTransaction(id: number, data: Partial<TransactionCreate>): Promise<{ data?: Transaction; error?: string }> {
  const response = await apiClient.put<Transaction>(`/transactions/${id}`, data);

  if (response.error) return { error: response.error };
  return { data: response.data };
}

export async function deleteTransaction(id: number): Promise<{ error?: string }> {
  const response = await apiClient.delete(`/transactions/${id}`);

  if (response.error) return { error: response.error };
  return {};
}