"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/hooks/useAuth";
import { getTransactions, Transaction } from "@/services/transactionService";
import TransactionTable from "@/components/transactions/TransactionTable";
import TransactionForm from "@/components/transactions/TransactionForm";

export default function TransactionsPage() {
  const { user, loading: authLoading } = useAuth(true);
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchTransactions = async () => {
    const { data, error } = await getTransactions({ limit: 100 });
    if (data) setTransactions(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
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
      <main className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-xl font-bold text-primary-800">تراکنش‌ها</h1>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              + تراکنش جدید
            </button>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-6">
          {showForm && (
            <div className="mb-6">
              <TransactionForm
                onSuccess={handleSuccess}
                onCancel={() => setShowForm(false)}
              />
            </div>
          )}

          <TransactionTable transactions={transactions} />
        </div>
      </main>
    </AuthGuard>
  );
}