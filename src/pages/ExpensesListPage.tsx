import { useExpensesByMonth } from '../hooks/useFinance';

interface ExpensesListPageProps {
  month: string;
  onMonthChange: (month: string) => void;
}

export function ExpensesListPage({ month }: ExpensesListPageProps) {
  const { data: expenses } = useExpensesByMonth(month);

  return (
    <div>
      <h2>Expenses - {month}</h2>
      {expenses && expenses.length > 0 ? (
        <div className="expenses-list">
          {expenses.map((exp) => (
            <div key={exp.id} className="expense-item">
              <div>{exp.note || 'Expense'}</div>
              <div>${exp.amount.toFixed(2)}</div>
              <div>{exp.date}</div>
            </div>
          ))}
        </div>
      ) : (
        <p>No expenses for this month.</p>
      )}
    </div>
  );
}
