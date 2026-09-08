"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import {
  getTransactions,
  Transaction,
} from "@/services/transactionService";
import TransactionTable from "@/components/transactions/TransactionTable";
import TransactionForm from "@/components/transactions/TransactionForm";

export default function TransactionsPage() {
  const { loading: authLoading } = useAuth(true);
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

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
    fetchTransactions();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-primary-800">تراکنش‌ها</h1>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            + تراکنش جدید
          </button>
        </div>

        {showForm && (
          <div className="mb-6">
            <TransactionForm
              onSuccess={handleSuccess}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        <TransactionTable transactions={transactions} />
      </DashboardLayout>
    </AuthGuard>
  );
}