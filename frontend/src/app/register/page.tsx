"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiClient } from "@/services/apiClient";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("رمز عبور و تکرار آن یکسان نیست.");
      return;
    }

    if (password.length < 8) {
      setError("رمز عبور باید حداقل ۸ کاراکتر باشد.");
      return;
    }

    setLoading(true);

    // 1. ثبت‌نام
    const registerRes = await apiClient.post("/auth/register", {
      full_name: fullName,
      email,
      password,
    });

    if (registerRes.error) {
      setError(registerRes.error);
      setLoading(false);
      return;
    }

    // 2. ورود خودکار بعد از ثبت‌نام
    const loginRes = await apiClient.post<{ access_token: string }>(
      "/auth/login",
      { email, password }
    );

    setLoading(false);

    if (loginRes.error || !loginRes.data) {
      setError("ثبت‌نام موفق بود، ولی ورود خودکار ناموفق بود. لطفاً وارد شو.");
      return;
    }

    localStorage.setItem("access_token", loginRes.data.access_token);
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
            همین حالا حساب خودت را بساز
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <h2 className="text-lg font-bold text-primary-800">ثبت‌نام</h2>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="label" htmlFor="full_name">
              نام و نام خانوادگی
            </label>
            <input
              id="full_name"
              type="text"
              className="input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              minLength={2}
              maxLength={100}
              placeholder="مثلاً: پوریا رضایی"
            />
          </div>

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
              minLength={8}
              maxLength={72}
              placeholder="حداقل ۸ کاراکتر"
            />
          </div>

          <div>
            <label className="label" htmlFor="confirm_password">
              تکرار رمز عبور
            </label>
            <input
              id="confirm_password"
              type="password"
              dir="ltr"
              className="input text-left"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              maxLength={72}
              placeholder="********"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? "در حال ثبت‌نام..." : "ساخت حساب"}
          </button>

          <p className="text-center text-sm text-gray-500">
            قبلاً ثبت‌نام کردی؟{" "}
            <Link
              href="/login"
              className="font-medium text-primary-600 hover:underline"
            >
              وارد شو
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}