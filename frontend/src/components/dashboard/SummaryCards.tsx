import { Summary } from "@/services/dashboardService";

function formatMoney(amount: string): string {
  const num = parseFloat(amount);
  if (isNaN(num)) return "۰";

  return num.toLocaleString("fa-IR") + " تومان";
}

export default function SummaryCards({ summary }: { summary: Summary | null }) {
  if (!summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
            <div className="h-6 bg-gray-200 rounded w-32"></div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "درآمد این ماه",
      value: summary.income_this_month,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "هزینه این ماه",
      value: summary.expense_this_month,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      title: "مانده این ماه",
      value: summary.balance_this_month,
      color: "text-primary-600",
      bg: "bg-primary-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {cards.map((card, index) => (
        <div key={index} className="card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">{card.title}</h3>
            <span className={`w-2 h-2 rounded-full ${card.bg}`}></span>
          </div>
          <p className={`text-xl font-bold ${card.color}`}>
            {formatMoney(card.value)}
          </p>
        </div>
      ))}
    </div>
  );
}