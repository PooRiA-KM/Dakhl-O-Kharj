"use client";

import { useState } from "react";
import {
  Account,
  AccountType,
  createAccount,
  updateAccount,
} from "@/services/accountService";

interface Props {
  initial?: Account | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AccountForm({ initial, onSuccess, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState<AccountType>(initial?.type ?? "bank");
  const [initialBalance, setInitialBalance] = useState(
    initial ? String(Number(initial.initial_balance)) : "0"
  );
  const [isDefault, setIsDefault] = useState(initial?.is_default ?? false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    const payload = {
      name,
      type,
      initial_balance: Number(initialBalance) || 0,
      is_default: isDefault,
    };

    const res = initial
      ? await updateAccount(initial.id, payload)
      : await createAccount(payload);

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
        {initial ? "ویرایش حساب" : "حساب جدید"}
      </h2>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="label">نام حساب</label>
        <input
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={100}
          placeholder="مثلاً: کارت بانک ملت"
        />
      </div>

      <div>
        <label className="label">نوع حساب</label>
        <select
          className="input"
          value={type}
          onChange={(e) => setType(e.target.value as AccountType)}
        >
          <option value="bank">بانکی</option>
          <option value="cash">نقدی</option>
          <option value="card">کارت</option>
          <option value="wallet">کیف پول</option>
        </select>
      </div>

      <div>
        <label className="label">موجودی اولیه (تومان)</label>
        <input
          className="input"
          type="number"
          min={0}
          value={initialBalance}
          onChange={(e) => setInitialBalance(e.target.value)}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={isDefault}
          onChange={(e) => setIsDefault(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300"
        />
        این حساب، حساب پیش‌فرض من باشد
      </label>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="btn-secondary">
          انصراف
        </button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "در حال ذخیره..." : "ذخیره"}
        </button>
      </div>
    </form>
  );
}