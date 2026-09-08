import { apiClient } from "./apiClient";

export type AccountType = "cash" | "bank" | "card" | "wallet";

export interface Account {
  id: number;
  user_id: number;
  name: string;
  type: AccountType;
  initial_balance: string;
  is_default: boolean;
  created_at: string;
}

export interface AccountPayload {
  name: string;
  type: AccountType;
  initial_balance: number;
  is_default: boolean;
}

export async function getAccounts() {
  return apiClient.get<Account[]>("/accounts");
}

export async function createAccount(payload: AccountPayload) {
  return apiClient.post<Account>("/accounts", payload);
}

export async function updateAccount(id: number, payload: Partial<AccountPayload>) {
  return apiClient.put<Account>(`/accounts/${id}`, payload);
}

export async function deleteAccount(id: number) {
  return apiClient.delete<void>(`/accounts/${id}`);
}