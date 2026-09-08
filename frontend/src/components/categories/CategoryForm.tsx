"use client";

import { useState } from "react";
import {
  Category,
  CategoryType,
  createCategory,
  updateCategory,
} from "@/services/categoryService";

const COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#6b7280",
];

interface Props {
  initial?: Category | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CategoryForm({ initial, onSuccess, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState<CategoryType>(initial?.type ?? "expense");
  const [color, setColor] = useState(initial?.color ?? COLORS[0]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    const payload = { name, type, color };

    const res = initial
      ? await updateCategory(initial.id, payload)
      : await createCategory(payload);

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
        {initial ? "ویرایش دسته‌بندی" : "دسته‌بندی جدید"}
      </h2>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="label">نام دسته‌بندی</label>
        <input
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={100}
          placeholder="مثلاً: خوراک"
        />
      </div>

      <div>
        <label className="label">نوع</label>
        <select
          className="input"
          value={type}
          onChange={(e) => setType(e.target.value as CategoryType)}
        >
          <option value="expense">هزینه</option>
          <option value="income">درآمد</option>
          <option value="both">هر دو</option>
        </select>
      </div>

      <div>
        <label className="label">رنگ</label>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setColor(c)}
              className={`h-8 w-8 rounded-full border-2 transition-transform ${
                color === c
                  ? "scale-110 border-gray-800"
                  : "border-transparent hover:scale-105"
              }`}
              style={{ backgroundColor: c }}
              aria-label={`رنگ ${c}`}
            />
          ))}
        </div>
      </div>

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