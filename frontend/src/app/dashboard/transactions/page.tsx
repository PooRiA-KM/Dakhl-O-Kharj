"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import DashboardLayout from "@/components/layout/DashboardLayout";
import TransactionForm from "@/components/transactions/TransactionForm";
import TransactionTable from "@/components/transactions/TransactionTable";
import { useAuth } from "@/hooks/useAuth";
import {
  Transaction,
  deleteTransaction,
  getTransactions,
} from "@/services/transactionService";

export default function TransactionsPage() {
  const { loading: authLoading } = useAuth(true);
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    const { data } = await getTransactions({ limit: 100 });
    if (data) setTransactions(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // اگر با ?new=1 آمده باشیم، فرم را باز کن
  useEffect(() => {
    if (window.location.search.includes("new=1")) {
      setShowForm(true);
    }
  }, []);

  const handleSuccess = () => {
    setShowForm(false);
    setEditing(null);
    fetchTransactions();
  };

  const handleDelete = async (transaction: Transaction) => {
    const ok = window.confirm(`تراکنش «${transaction.title}» حذف شود؟`);

    if (!ok) return;

    const res = await deleteTransaction(transaction.id);

    if (res.error) {
      window.alert(res.error);
      return;
    }

    fetchTransactions();
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
          <h1 className="text-xl font-bold text-primary-800">تراکنش‌ها</h1>
          <button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="btn-primary"
          >
            + تراکنش جدید
          </button>
        </div>

        {(showForm || editing) && (
          <div className="mb-6">
            <TransactionForm
              initial={editing}
              onSuccess={handleSuccess}
              onCancel={() => {
                setShowForm(false);
                setEditing(null);
              }}
            />
          </div>
        )}

        <TransactionTable
          transactions={transactions}
          onEdit={(t) => {
            setShowForm(false);
            setEditing(t);
          }}
          onDelete={handleDelete}
        />
      </DashboardLayout>
    </AuthGuard>
  );
}