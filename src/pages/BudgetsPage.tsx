import { useBudgetsByMonth } from '../hooks/useFinance';

interface BudgetsPageProps {
  month: string;
  onMonthChange: (month: string) => void;
}

export function BudgetsPage({ month }: BudgetsPageProps) {
  const { data: budgets } = useBudgetsByMonth(month);

  return (
    <div>
      <h2>Budgets - {month}</h2>
      {budgets && budgets.length > 0 ? (
        <div className="budgets-list">
          {budgets.map((bud) => (
            <div key={bud.id} className="budget-item">
              <div>Category: {bud.categoryId}</div>
              <div>Monthly Limit: ${bud.monthlyLimit.toFixed(2)}</div>
            </div>
          ))}
        </div>
      ) : (
        <p>No budgets set for this month.</p>
      )}
    </div>
  );
}
