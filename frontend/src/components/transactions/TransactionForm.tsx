"use client";

import { useEffect, useState } from "react";
import {
  Account,
  getAccounts,
} from "@/services/accountService";
import {
  Category,
  getCategories,
} from "@/services/categoryService";
import {
  Transaction,
  TransactionPayload,
  TransactionType,
  createTransaction,
  updateTransaction,
} from "@/services/transactionService";

interface Props {
  initial?: Transaction | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function TransactionForm({ initial, onSuccess, onCancel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [type, setType] = useState<TransactionType>(initial?.type ?? "expense");
  const [amount, setAmount] = useState(
    initial ? String(Number(initial.amount)) : ""
  );
  const [categoryId, setCategoryId] = useState<string>(
    initial?.category_id ? String(initial.category_id) : ""
  );
  const [accountId, setAccountId] = useState<string>(
    initial?.account_id ? String(initial.account_id) : ""
  );
  const [date, setDate] = useState<string>(
    initial?.occurred_at
      ? new Date(initial.occurred_at).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10)
  );
  const [description, setDescription] = useState(initial?.description ?? "");

  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadOptions() {
      const [cats, accs] = await Promise.all([getCategories(), getAccounts()]);
      if (cats.data) setCategories(cats.data);
      if (accs.data) setAccounts(accs.data);
    }

    loadOptions();
  }, []);

  // فقط دسته‌بندی‌هایی که با نوع تراکنش سازگار هستند
  const compatibleCategories = categories.filter(
    (c) => c.type === type || c.type === "both"
  );

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);

    // اگر دسته‌بندی انتخاب‌شده با نوع جدید سازگار نیست، پاکش کن
    const selected = categories.find((c) => String(c.id) === categoryId);

    if (selected && selected.type !== newType && selected.type !== "both") {
      setCategoryId("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const amountNumber = Number(amount);

    if (!amount || isNaN(amountNumber) || amountNumber <= 0) {
      setError("لطفاً مبلغ معتبر وارد کنید.");
      return;
    }

    if (!title.trim()) {
      setError("لطفاً عنوان تراکنش را وارد کنید.");
      return;
    }

    setSaving(true);

    const payload: TransactionPayload = {
      title: title.trim(),
      amount: amountNumber,
      type,
      category_id: categoryId ? Number(categoryId) : null,
      account_id: accountId ? Number(accountId) : null,
      occurred_at: date ? new Date(`${date}T12:00:00Z`).toISOString() : null,
      description: description.trim() || null,
    };

    const res = initial
      ? await updateTransaction(initial.id, payload)
      : await createTransaction(payload);

    setSaving(false);

    if (res.error) {
      setError(res.error);
      return;
    }

    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <h2 className="text-lg font-bold text-primary-800">
        {initial ? "ویرایش تراکنش" : "تراکنش جدید"}
      </h2>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="label">نوع تراکنش</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleTypeChange("expense")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              type === "expense"
                ? "bg-red-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            هزینه
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange("income")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              type === "income"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            درآمد
          </button>
        </div>
      </div>

      <div>
        <label className="label">عنوان</label>
        <input
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={200}
          placeholder="مثلاً: خرید سوپرمارکت"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">مبلغ (تومان)</label>
          <input
            className="input"
            type="number"
            min={1}
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            placeholder="مثلاً: 250000"
          />
        </div>
        <div>
          <label className="label">تاریخ</label>
          <input
            className="input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">دسته‌بندی</label>
          <select
            className="input"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">بدون دسته‌بندی</option>
            {compatibleCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">حساب</label>
          <select
            className="input"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
          >
            <option value="">بدون حساب</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label">توضیحات (اختیاری)</label>
        <textarea
          className="input"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={5000}
        />
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="btn-secondary">
          انصراف
        </button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving
            ? "در حال ذخیره..."
            : initial
              ? "ذخیره تغییرات"
              : "ثبت تراکنش"}
        </button>
      </div>
    </form>
  );
}