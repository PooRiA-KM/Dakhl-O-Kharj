import { apiClient } from "./apiClient";

export type CategoryType = "income" | "expense" | "both";

export interface Category {
  id: number;
  user_id: number;
  name: string;
  type: CategoryType;
  color: string | null;
  icon: string | null;
  is_default: boolean;
  created_at: string;
}

export interface CategoryPayload {
  name: string;
  type: CategoryType;
  color?: string | null;
  icon?: string | null;
}

export async function getCategories(type?: CategoryType) {
  const query = type ? `?type=${type}` : "";
  return apiClient.get<Category[]>(`/categories${query}`);
}

export async function createCategory(payload: CategoryPayload) {
  return apiClient.post<Category>("/categories", payload);
}

export async function updateCategory(id: number, payload: Partial<CategoryPayload>) {
  return apiClient.put<Category>(`/categories/${id}`, payload);
}

export async function deleteCategory(id: number) {
  return apiClient.delete<void>(`/categories/${id}`);
}