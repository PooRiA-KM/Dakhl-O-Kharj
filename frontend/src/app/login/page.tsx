"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiClient } from "@/services/apiClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await apiClient.post<{ access_token: string }>(
      "/auth/login",
      { email, password }
    );

    setLoading(false);

    if (res.error || !res.data) {
      setError(res.error || "ورود ناموفق بود.");
      return;
    }

    localStorage.setItem("access_token", res.data.access_token);
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-extrabold text-primary-800">
            دخل و خرج
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            مدیریت درآمد و هزینه‌های شخصی
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <h2 className="text-lg font-bold text-primary-800">
            ورود به حساب کاربری
          </h2>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="label" htmlFor="email">
              ایمیل
            </label>
            <input
              id="email"
              type="email"
              dir="ltr"
              className="input text-left"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="label" htmlFor="password">
              رمز عبور
            </label>
            <input
              id="password"
              type="password"
              dir="ltr"
              className="input text-left"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="********"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? "در حال ورود..." : "ورود"}
          </button>

          <p className="text-center text-sm text-gray-500">
            حساب کاربری نداری؟{" "}
            <Link
              href="/register"
              className="font-medium text-primary-600 hover:underline"
            >
              ثبت‌نام کن
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}