"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/services/apiClient";

export function useAuth(redirectToLogin = false) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

    if (!token) {
      setLoading(false);
      if (redirectToLogin) router.push("/login");
      return;
    }

    apiClient.get("/users/me").then((res) => {
      if (res.data) {
        setUser(res.data);
      } else {
        if (typeof window !== "undefined") localStorage.removeItem("access_token");
        if (redirectToLogin) router.push("/login");
      }
      setLoading(false);
    });
  }, [redirectToLogin, router]);

  const logout = () => {
    if (typeof window !== "undefined") localStorage.removeItem("access_token");
    router.push("/login");
  };

  return { user, loading, logout };
}