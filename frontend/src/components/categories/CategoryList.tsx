"use client";

import { Category } from "@/services/categoryService";

const typeLabels: Record<string, string> = {
  income: "درآمد",
  expense: "هزینه",
  both: "هر دو",
};

const typeStyles: Record<string, string> = {
  income: "bg-green-50 text-green-700",
  expense: "bg-red-50 text-red-700",
  both: "bg-blue-50 text-blue-700",
};

interface Props {
  categories: Category[] | null;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export default function CategoryList({ categories, onEdit, onDelete }: Props) {
  if (categories === null) {
    return <div className="card h-40 animate-pulse" />;
  }

  if (categories.length === 0) {
    return (
      <div className="card py-10 text-center text-gray-500">
        هنوز دسته‌بندی‌ای ندارید.
      </div>
    );
  }

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-gray-500">
            <th className="px-4 py-3 text-right font-medium">نام</th>
            <th className="px-4 py-3 text-right font-medium">نوع</th>
            <th className="px-4 py-3 text-right font-medium">رنگ</th>
            <th className="px-4 py-3 text-right font-medium">وضعیت</th>
            <th className="px-4 py-3 text-left font-medium">عملیات</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-800">{c.name}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    typeStyles[c.type] ?? "bg-gray-100 text-gray-600"
                  }`}
                >
                  {typeLabels[c.type] ?? c.type}
                </span>
              </td>
              <td className="px-4 py-3">
                <span
                  className="inline-block h-4 w-4 rounded-full"
                  style={{ backgroundColor: c.color ?? "#9ca3af" }}
                />
              </td>
              <td className="px-4 py-3 text-gray-500">
                {c.is_default ? "پیش‌فرض" : "سفارشی"}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => onEdit(c)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    ویرایش
                  </button>
                  <button
                    onClick={() => onDelete(c)}
                    className="text-xs text-red-600 hover:underline"
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
  );
}