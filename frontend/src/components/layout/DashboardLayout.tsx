"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth(true);
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { href: "/dashboard", label: "داشبورد" },
    { href: "/dashboard/transactions", label: "تراکنش‌ها" },
    { href: "/dashboard/categories", label: "دسته‌بندی‌ها" },
    { href: "/dashboard/accounts", label: "حساب‌ها" },
    { href: "/dashboard/reports", label: "گزارش‌ها" },
    ...(user?.is_admin
      ? [
          { href: "/dashboard/admin", label: "پنل مدیریت" },
          { href: "/dashboard/admin/users", label: "کاربران" },
          { href: "/dashboard/admin/transactions", label: "تراکنش‌های کل" },
        ]
      : []),
  ];

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-20 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center justify-between gap-3">
            {/* لوگو */}
            <Link
              href="/dashboard"
              onClick={closeMenu}
              className="shrink-0 text-lg font-bold text-primary-800 md:text-xl"
            >
              دخل و خرج
            </Link>

            {/* منوی افقی: فقط دسکتاپ */}
            <nav className="hidden items-center gap-1 lg:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`whitespace-nowrap px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? "bg-primary-50 text-primary-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* نام کاربر و خروج: فقط دسکتاپ */}
            <div className="hidden items-center gap-3 lg:flex">
              <span className="max-w-[140px] truncate text-sm text-gray-600">
                {user?.full_name}
              </span>
              <button onClick={logout} className="btn-secondary text-sm">
                خروج
              </button>
            </div>

            {/* دکمه همبرگری: فقط موبایل و تبلت */}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
              aria-label="باز و بسته کردن منو"
            >
              {menuOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* منوی کشویی موبایل */}
        {menuOpen && (
          <div className="border-t border-gray-100 bg-white px-4 pb-4 pt-2 shadow-md lg:hidden">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? "bg-primary-50 text-primary-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-3 flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
              <span className="truncate text-sm text-gray-600">
                {user?.full_name}
              </span>
              <button onClick={logout} className="btn-secondary shrink-0 text-sm">
                خروج
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}