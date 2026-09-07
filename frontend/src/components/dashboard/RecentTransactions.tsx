import { RecentTransaction } from "@/services/dashboardService";

function formatMoney(amount: string): string {
  const num = parseFloat(amount);
  if (isNaN(num)) return "۰";

  return num.toLocaleString("fa-IR");
}

export default function RecentTransactions({ transactions }: { transactions: RecentTransaction[] | null }) {
  if (!transactions) {
    return (
      <div className="card animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-32 mb-4"></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-gray-100 rounded mb-2"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">تراکنش‌های اخیر</h3>

      {transactions.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          هنوز تراکنشی ثبت نشده است
        </p>
      ) : (
        <div className="space-y-3">
          {transactions.map((t) => (
            <div key={t.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  t.type === "income" ? "bg-green-100" : "bg-red-100"
                }`}>
                  <span className={`text-lg ${
                    t.type === "income" ? "text-green-600" : "text-red-600"
                  }`}>
                    {t.type === "income" ? "↑" : "↓"}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">{t.title}</p>
                  <p className="text-xs text-gray-500">
                    {t.category?.name || "بدون دسته‌بندی"}
                  </p>
                </div>
              </div>
              <div className="text-left">
                <p className={`font-medium ${
                  t.type === "income" ? "text-green-600" : "text-red-600"
                }`}>
                  {t.type === "income" ? "+" : "-"}{formatMoney(t.amount)}
                </p>
                <p className="text-xs text-gray-500">{t.occurred_at_persian}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}