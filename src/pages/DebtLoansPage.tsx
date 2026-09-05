import { useDebtLoans } from '../hooks/useFinance';

export function DebtLoansPage() {
  const { data: debts } = useDebtLoans();

  return (
    <div>
      <h2>Debts & Loans</h2>
      {debts && debts.length > 0 ? (
        <div className="debts-list">
          {debts.map((debt) => (
            <div key={debt.id} className="debt-item">
              <h3>{debt.personName}</h3>
              <p>Type: {debt.type}</p>
              <p>Amount: ${debt.amount.toFixed(2)}</p>
              <p>Remaining: ${debt.amountRemaining.toFixed(2)}</p>
              <p>Purpose: {debt.purpose}</p>
              <p>Status: {debt.status}</p>
              <p className="debt-date">Date: {debt.date}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No debts or loans tracked yet.</p>
      )}
    </div>
  );
}
