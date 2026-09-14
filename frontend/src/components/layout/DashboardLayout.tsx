"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth(true);
  const pathname = usePathname();

  // ✅ باید اینجا باشد، داخل کامپوننت و بعد از useAuth
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link
                href="/dashboard"
                className="text-xl font-bold text-primary-800"
              >
                دخل و خرج
              </Link>

              <nav className="flex items-center gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname === item.href
                        ? "bg-primary-50 text-primary-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                {user?.full_name}
              </span>
              <button onClick={logout} className="btn-secondary text-sm">
                خروج
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}