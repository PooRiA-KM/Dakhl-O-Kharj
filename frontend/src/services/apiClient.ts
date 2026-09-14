const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

class ApiClient {
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // فقط اگر در مرورگر بودیم به localStorage دسترسی داشته باشیم
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    body?: any
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        return {
          status: response.status,
          error: data?.detail || "خطایی رخ داد.",
        };
      }

      return {
        status: response.status,
        data: data as T,
      };
    } catch {
      return {
        status: 500,
        error: "اتصال به سرور برقرار نشد.",
      };
    }
  }

  get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>("GET", endpoint);
  }

  post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>("POST", endpoint, body);
  }

  put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>("PUT", endpoint, body);
  }

  delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>("DELETE", endpoint);
  }
}

export const apiClient = new ApiClient();