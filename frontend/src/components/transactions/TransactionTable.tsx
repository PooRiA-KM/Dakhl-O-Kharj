import { Transaction } from "@/services/transactionService";

function formatMoney(amount: string): string {
  const num = parseFloat(amount);
  if (isNaN(num)) return "۰";

  return num.toLocaleString("fa-IR");
}

export default function TransactionTable({ transactions }: { transactions: Transaction[] | null }) {
  if (!transactions) {
    return (
      <div className="card animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-32 mb-4"></div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 bg-gray-100 rounded mb-2"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">لیست تراکنش‌ها</h3>

      {transactions.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          تراکنشی یافت نشد
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">عنوان</th>
                <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">دسته‌بندی</th>
                <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">مبلغ</th>
                <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">نوع</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-2">{t.title}</td>
                  <td className="py-3 px-2 text-gray-500">
                    {t.category?.name || "بدون دسته‌بندی"}
                  </td>
                  <td className={`py-3 px-2 font-medium ${
                    t.type === "income" ? "text-green-600" : "text-red-600"
                  }`}>
                    {formatMoney(t.amount)}
                  </td>
                  <td className="py-3 px-2">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs ${
                      t.type === "income"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {t.type === "income" ? "درآمد" : "هزینه"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}