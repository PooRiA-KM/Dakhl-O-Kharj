"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import {
  AdminUser,
  deleteAdminUser,
  getAdminUsers,
  updateAdminUser,
} from "@/services/adminService";

const fmt = (v: string | number) => Number(v).toLocaleString("fa-IR");

export default function AdminUsersPage() {
  const { user, loading: authLoading } = useAuth(true);
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [search, setSearch] = useState("");

  const fetchUsers = async (searchValue = "") => {
    const res = await getAdminUsers({ search: searchValue, limit: 100 });
    if (res.data) setUsers(res.data.items);
  };

  useEffect(() => {
    if (user?.is_admin) fetchUsers();
  }, [user]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (user?.is_admin) fetchUsers(search);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const toggleActive = async (u: AdminUser) => {
    const action = u.is_active ? "غیرفعال" : "فعال";
    if (!window.confirm(`کاربر «${u.full_name}» ${action} شود؟`)) return;
    await updateAdminUser(u.id, { is_active: !u.is_active });
    fetchUsers(search);
  };

  const toggleAdmin = async (u: AdminUser) => {
    const action = u.is_admin ? "حذف نقش مدیر" : "ارتقا به مدیر";
    if (!window.confirm(`برای «${u.full_name}»: ${action}؟`)) return;
    await updateAdminUser(u.id, { is_admin: !u.is_admin });
    fetchUsers(search);
  };

  const removeUser = async (u: AdminUser) => {
    if (
      !window.confirm(
        `کاربر «${u.full_name}» و همه تراکنش‌هایش برای همیشه حذف شود؟`
      )
    )
      return;
    const res = await deleteAdminUser(u.id);
    if (res.error) window.alert(res.error);
    fetchUsers(search);
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user?.is_admin) {
    return (
      <DashboardLayout>
        <div className="card py-12 text-center text-gray-500">
          دسترسی مدیر لازم است.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-xl font-bold text-primary-800">مدیریت کاربران</h1>
          <input
            className="input max-w-xs"
            placeholder="جستجو بر اساس نام یا ایمیل..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {users === null ? (
          <div className="card h-40 animate-pulse" />
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500">
                  <th className="px-4 py-3 text-right font-medium">کاربر</th>
                  <th className="px-4 py-3 text-right font-medium">نقش</th>
                  <th className="px-4 py-3 text-right font-medium">وضعیت</th>
                  <th className="px-4 py-3 text-right font-medium">عضویت</th>
                  <th className="px-4 py-3 text-right font-medium">تراکنش‌ها</th>
                  <th className="px-4 py-3 text-right font-medium">درآمد / هزینه</th>
                  <th className="px-4 py-3 text-left font-medium">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{u.full_name}</div>
                      <div className="text-xs text-gray-500" dir="ltr">
                        {u.email}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {u.is_admin ? (
                        <span className="rounded-full bg-purple-50 px-2 py-1 text-xs text-purple-700">
                          مدیر
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                          کاربر
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {u.is_active ? (
                        <span className="rounded-full bg-green-50 px-2 py-1 text-xs text-green-700">
                          فعال
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-50 px-2 py-1 text-xs text-red-700">
                          غیرفعال
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                      {new Date(u.created_at).toLocaleDateString("fa-IR")}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {fmt(u.transaction_count)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="text-green-600">+{fmt(u.total_income)}</span>
                      {" / "}
                      <span className="text-red-600">−{fmt(u.total_expense)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => toggleActive(u)}
                          className={`rounded-lg px-2 py-1 text-xs ${
                            u.is_active
                              ? "bg-red-50 text-red-600 hover:bg-red-100"
                              : "bg-green-50 text-green-600 hover:bg-green-100"
                          }`}
                        >
                          {u.is_active ? "غیرفعال‌سازی" : "فعال‌سازی"}
                        </button>
                        <button
                          onClick={() => toggleAdmin(u)}
                          className="rounded-lg bg-purple-50 px-2 py-1 text-xs text-purple-600 hover:bg-purple-100"
                        >
                          {u.is_admin ? "حذف مدیر" : "کردن به مدیر"}
                        </button>
                        <button
                          onClick={() => removeUser(u)}
                          disabled={u.id === user.id}
                          className="rounded-lg bg-gray-100 px-2 py-1 text-xs text-gray-600 hover:bg-gray-200 disabled:opacity-40"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardLayout>
    </AuthGuard>
  );
}