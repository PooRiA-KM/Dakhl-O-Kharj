import { apiClient } from "./apiClient";

export interface User {
  id: number;
  full_name: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export async function register(data: {
  full_name: string;
  email: string;
  password: string;
}): Promise<{ user?: User; error?: string }> {
  const response = await apiClient.post<User>("/auth/register", data);

  if (response.error) {
    return { error: response.error };
  }

  return { user: response.data };
}

export async function login(data: {
  email: string;
  password: string;
}): Promise<{ token?: string; error?: string }> {
  const response = await apiClient.post<AuthResponse>("/auth/login", data);

  if (response.error) {
    return { error: response.error };
  }

  if (response.data) {
    localStorage.setItem("access_token", response.data.access_token);
    return { token: response.data.access_token };
  }

  return { error: "خطای ناشناخته" };
}

export async function getCurrentUser(): Promise<{ user?: User; error?: string }> {
  const response = await apiClient.get<User>("/users/me");

  if (response.error) {
    return { error: response.error };
  }

  return { user: response.data };
}

export function logout(): void {
  localStorage.removeItem("access_token");
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem("access_token");
}