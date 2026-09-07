const API_URL = "http://localhost:8000/api/v1"; // Hardcode for now

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

    const token = localStorage.getItem("access_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    body?: any
  ): Promise<ApiResponse<T>> {
    console.log(`[API] ${method} ${API_URL}${endpoint}`);

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json().catch(() => null);

      console.log(`[API] Response:`, response.status, data);

      if (!response.ok) {
        return {
          status: response.status,
          error: data?.detail || "خطایی رخ داد",
        };
      }

      return {
        status: response.status,
        data: data as T,
      };
    } catch (error: any) {
      console.error(`[API] Error:`, error);
      return {
        status: 500,
        error: error.message || "خطای شبکه",
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