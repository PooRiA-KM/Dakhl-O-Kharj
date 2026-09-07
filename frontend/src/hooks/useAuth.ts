"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, isAuthenticated, logout, User } from "@/services/authService";

export function useAuth(requireAuth: boolean = false) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      if (!isAuthenticated()) {
        if (requireAuth) {
          router.push("/login");
        } else {
          setLoading(false);
        }
        return;
      }

      const { user, error } = await getCurrentUser();

      if (error || !user) {
        logout();
        if (requireAuth) {
          router.push("/login");
        }
      } else {
        setUser(user);
      }

      setLoading(false);
    }

    checkAuth();
  }, [requireAuth, router]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return { user, loading, isAuthenticated: isAuthenticated(), logout: handleLogout };
}