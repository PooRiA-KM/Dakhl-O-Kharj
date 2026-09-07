"use client";

import { useState } from "react";
import { createTransaction } from "@/services/transactionService";

interface TransactionFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function TransactionForm({ onSuccess, onCancel }: TransactionFormProps) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("مبلغ باید یک عدد مثبت باشد");
      return;
    }

    setLoading(true);

    const { data, error } = await createTransaction({
      title,
      amount: amountNum,
      type,
      description: description || undefined,
    });

    if (error) {
      setError(error);
      setLoading(false);
      return;
    }

    onSuccess();
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">ثبت تراکنش جدید</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setType("expense")}
            className={`p-3 rounded-lg border-2 transition-colors ${
              type === "expense"
                ? "border-red-500 bg-red-50 text-red-700"
                : "border-gray-200 text-gray-600"
            }`}
          >
            هزینه
          </button>
          <button
            type="button"
            onClick={() => setType("income")}
            className={`p-3 rounded-lg border-2 transition-colors ${
              type === "income"
                ? "border-green-500 bg-green-50 text-green-700"
                : "border-gray-200 text-gray-600"
            }`}
          >
            درآمد
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            عنوان
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
            placeholder="مثلاً: خرید سوپرمارکت"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            مبلغ (تومان)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input-field"
            placeholder="0"
            min="0"
            step="0.01"
            required
            dir="ltr"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            توضیحات (اختیاری)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-field"
            rows={2}
            placeholder="توضیحات بیشتر..."
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1"
          >
            {loading ? "در حال ثبت..." : "ثبت تراکنش"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
          >
            انصراف
          </button>
        </div>
      </form>
    </div>
  );
}