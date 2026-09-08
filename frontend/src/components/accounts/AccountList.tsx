"use client";

import { Account } from "@/services/accountService";

const typeLabels: Record<string, string> = {
  cash: "نقدی",
  bank: "بانکی",
  card: "کارت",
  wallet: "کیف پول",
};

const fmt = (value: string | number) =>
  Number(value).toLocaleString("fa-IR");

interface Props {
  accounts: Account[] | null;
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
}

export default function AccountList({ accounts, onEdit, onDelete }: Props) {
  if (accounts === null) {
    return <div className="card h-40 animate-pulse" />;
  }

  if (accounts.length === 0) {
    return (
      <div className="card py-10 text-center text-gray-500">
        هنوز حسابی ندارید.
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
            <th className="px-4 py-3 text-right font-medium">موجودی اولیه</th>
            <th className="px-4 py-3 text-right font-medium">وضعیت</th>
            <th className="px-4 py-3 text-left font-medium">عملیات</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((a) => (
            <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-800">{a.name}</td>
              <td className="px-4 py-3">
                <span className="inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                  {typeLabels[a.type] ?? a.type}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-700">
                {fmt(a.initial_balance)} تومان
              </td>
              <td className="px-4 py-3">
                {a.is_default ? (
                  <span className="inline-block rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700">
                    پیش‌فرض
                  </span>
                ) : (
                  <span className="text-gray-400">معمولی</span>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => onEdit(a)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    ویرایش
                  </button>
                  <button
                    onClick={() => onDelete(a)}
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