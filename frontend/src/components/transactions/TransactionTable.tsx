"use client";

import { Transaction } from "@/services/transactionService";

const fmt = (value: string | number) =>
  Number(value).toLocaleString("fa-IR");

const persianDate = (t: Transaction) =>
  t.occurred_at_persian ??
  new Date(t.occurred_at).toLocaleDateString("fa-IR");

interface Props {
  transactions: Transaction[] | null;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

export default function TransactionTable({
  transactions,
  onEdit,
  onDelete,
}: Props) {
  if (transactions === null) {
    return <div className="card h-40 animate-pulse" />;
  }

  if (transactions.length === 0) {
    return (
      <div className="card py-10 text-center text-gray-500">
        هنوز تراکنشی ثبت نشده است.
      </div>
    );
  }

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-gray-500">
            <th className="px-4 py-3 text-right font-medium">تاریخ</th>
            <th className="px-4 py-3 text-right font-medium">عنوان</th>
            <th className="px-4 py-3 text-right font-medium">دسته‌بندی</th>
            <th className="px-4 py-3 text-right font-medium">حساب</th>
            <th className="px-4 py-3 text-right font-medium">مبلغ</th>
            <th className="px-4 py-3 text-left font-medium">عملیات</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
              <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                {persianDate(t)}
              </td>
              <td className="px-4 py-3">
                <div className="font-medium text-gray-800">{t.title}</div>
                {t.description && (
                  <div className="mt-0.5 text-xs text-gray-400">
                    {t.description}
                  </div>
                )}
              </td>
              <td className="px-4 py-3">
                {t.category ? (
                  <span className="inline-flex items-center gap-1.5 text-gray-600">
                    <span
                      className="inline-block h-3 w-3 rounded-full"
                      style={{ backgroundColor: t.category.color ?? "#9ca3af" }}
                    />
                    {t.category.name}
                  </span>
                ) : (
                  <span className="text-gray-300">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {t.account?.name ?? <span className="text-gray-300">—</span>}
              </td>
              <td
                className={`whitespace-nowrap px-4 py-3 font-medium ${
                  t.type === "income" ? "text-green-600" : "text-red-600"
                }`}
              >
                {t.type === "income" ? "+" : "−"} {fmt(t.amount)}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => onEdit(t)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    ویرایش
                  </button>
                  <button
                    onClick={() => onDelete(t)}
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