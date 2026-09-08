"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AccountForm from "@/components/accounts/AccountForm";
import AccountList from "@/components/accounts/AccountList";
import { useAuth } from "@/hooks/useAuth";
import {
  Account,
  deleteAccount,
  getAccounts,
} from "@/services/accountService";

export default function AccountsPage() {
  const { loading: authLoading } = useAuth(true);
  const [accounts, setAccounts] = useState<Account[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAccounts = async () => {
    setLoading(true);
    const { data } = await getAccounts();
    if (data) setAccounts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleDelete = async (account: Account) => {
    const ok = window.confirm(
      `حساب «${account.name}» حذف شود؟\nتراکنش‌های آن بدون حساب باقی می‌مانند.`
    );

    if (!ok) return;

    const res = await deleteAccount(account.id);

    if (res.error) {
      window.alert(res.error);
      return;
    }

    fetchAccounts();
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditing(null);
    fetchAccounts();
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary-800">حساب‌ها</h1>
          <button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="btn-primary"
          >
            + حساب جدید
          </button>
        </div>

        {(showForm || editing) && (
          <div className="mb-6">
            <AccountForm
              initial={editing}
              onSuccess={handleSuccess}
              onCancel={() => {
                setShowForm(false);
                setEditing(null);
              }}
            />
          </div>
        )}

        <AccountList
          accounts={accounts}
          onEdit={(a) => {
            setShowForm(false);
            setEditing(a);
          }}
          onDelete={handleDelete}
        />
      </DashboardLayout>
    </AuthGuard>
  );
}